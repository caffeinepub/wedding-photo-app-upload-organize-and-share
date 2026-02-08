import Time "mo:core/Time";
import Text "mo:core/Text";
import Int "mo:core/Int";
import Map "mo:core/Map";
import List "mo:core/List";
import Array "mo:core/Array";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import Iter "mo:core/Iter";
import Principal "mo:core/Principal";
import ExternalBlob "blob-storage/Storage";
import MixinAuthorization "authorization/MixinAuthorization";
import MixinStorage "blob-storage/Mixin";
import AccessControl "authorization/access-control";

actor {
  public type Photo = {
    id : Text;
    filename : Text;
    contentType : Text;
    byteSize : Nat;
    createdAt : Time.Time;
    caption : ?Text;
    blob : ExternalBlob.ExternalBlob;
    owner : Principal;
  };

  module Photo {
    public func compareByFilename(a : Photo, b : Photo) : Order.Order {
      Text.compare(a.filename, b.filename);
    };

    public func compareByCreatedAt(a : Photo, b : Photo) : Order.Order {
      Int.compare(a.createdAt, b.createdAt);
    };
  };

  public type Album = {
    id : Text;
    name : Text;
    createdAt : Time.Time;
    updatedAt : Time.Time;
    photoIds : [Text];
    owner : Principal;
  };

  module Album {
    public func compareByName(a : Album, b : Album) : Order.Order {
      Text.compare(a.name, b.name);
    };

    public func compareByCreatedAt(a : Album, b : Album) : Order.Order {
      Int.compare(a.createdAt, b.createdAt);
    };
  };

  public type UploadStatus = {
    photoId : Text;
    status : {
      #inProgress : Nat;
      #completed;
    };
  };

  public type UserProfile = {
    name : Text;
  };

  type AlbumMap = Map.Map<Text, Album>;
  type PhotoMap = Map.Map<Text, Photo>;
  type SharedAlbumMap = Map.Map<Text, Text>;

  let albums : AlbumMap = Map.empty<Text, Album>();
  let photos : PhotoMap = Map.empty<Text, Photo>();
  let sharedAlbums : SharedAlbumMap = Map.empty<Text, Text>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinStorage();

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  public shared ({ caller }) func createAlbum(name : Text) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create albums");
    };
    let id = generateId();
    let album : Album = {
      id;
      name;
      createdAt = Time.now();
      updatedAt = Time.now();
      photoIds = [];
      owner = caller;
    };
    albums.add(id, album);
    id;
  };

  public shared ({ caller }) func updateAlbumName(id : Text, newName : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update albums");
    };
    switch (albums.get(id)) {
      case (null) { Runtime.trap("Album not found") };
      case (?album) {
        if (album.owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: You can only update your own albums");
        };
        let updatedAlbum = {
          album with
          name = newName;
          updatedAt = Time.now();
        };
        albums.add(id, updatedAlbum);
      };
    };
  };

  public shared ({ caller }) func uploadPhotos(albumId : ?Text, filename : Text, contentType : Text, byteSize : Nat, caption : ?Text, blob : ExternalBlob.ExternalBlob) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can upload photos");
    };

    let photoId = generateId();
    let photo : Photo = {
      id = photoId;
      filename;
      contentType;
      byteSize;
      createdAt = Time.now();
      caption;
      blob;
      owner = caller;
    };
    photos.add(photoId, photo);

    let targetAlbumId = switch (albumId) {
      case (?id) {
        switch (albums.get(id)) {
          case (null) { Runtime.trap("Album not found") };
          case (?album) {
            if (album.owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
              Runtime.trap("Unauthorized: You can only upload to your own albums");
            };
            id;
          };
        };
      };
      case (null) { createDefaultAlbum("Default Album", caller) };
    };

    updateAlbumWithPhoto(targetAlbumId, photoId);
    photoId;
  };

  public shared ({ caller }) func updatePhotoCaption(photoId : Text, caption : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update photos");
    };
    switch (photos.get(photoId)) {
      case (null) { Runtime.trap("Photo not found") };
      case (?photo) {
        if (photo.owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: You can only update your own photos");
        };
        let updatedPhoto = { photo with caption = ?caption };
        photos.add(photoId, updatedPhoto);
      };
    };
  };

  public shared ({ caller }) func reorderPhotos(albumId : Text, newOrder : [Text]) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can reorder photos");
    };

    switch (albums.get(albumId)) {
      case (null) { Runtime.trap("Album not found") };
      case (?album) {
        if (album.owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: You can only reorder photos in your own albums");
        };
        let updatedAlbum = { album with photoIds = newOrder };
        albums.add(albumId, updatedAlbum);
      };
    };
  };

  public shared ({ caller }) func createShareLink(albumId : Text) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create share links");
    };

    switch (albums.get(albumId)) {
      case (null) { Runtime.trap("Album not found") };
      case (?album) {
        if (album.owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: You can only share your own albums");
        };
        let shareId = generateId();
        sharedAlbums.add(shareId, albumId);
        shareId;
      };
    };
  };

  public shared ({ caller }) func revokeShareLink(shareId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can revoke share links");
    };
    switch (sharedAlbums.get(shareId)) {
      case (null) { Runtime.trap("Share link not found") };
      case (?albumId) {
        switch (albums.get(albumId)) {
          case (null) { Runtime.trap("Album not found") };
          case (?album) {
            if (album.owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
              Runtime.trap("Unauthorized: You can only revoke share links for your own albums");
            };
            sharedAlbums.remove(shareId);
          };
        };
      };
    };
  };

  public query ({ caller }) func getAlbum(id : Text) : async Album {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view albums");
    };
    switch (albums.get(id)) {
      case (null) { Runtime.trap("Album not found") };
      case (?album) {
        if (album.owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: You can only view your own albums");
        };
        album;
      };
    };
  };

  public query ({ caller }) func getAlbums() : async [Album] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view albums");
    };
    let isAdmin = AccessControl.isAdmin(accessControlState, caller);
    let userAlbums = List.empty<Album>();

    for (album in albums.values()) {
      if (album.owner == caller or isAdmin) {
        userAlbums.add(album);
      };
    };

    userAlbums.toArray().sort(Album.compareByName);
  };

  public query ({ caller }) func getPhoto(id : Text) : async Photo {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view photos");
    };
    switch (photos.get(id)) {
      case (null) { Runtime.trap("Photo not found") };
      case (?photo) {
        if (photo.owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: You can only view your own photos");
        };
        photo;
      };
    };
  };

  public query ({ caller }) func getPhotos(ids : [Text]) : async [Photo] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view photos");
    };
    let isAdmin = AccessControl.isAdmin(accessControlState, caller);
    let resultList = List.empty<Photo>();

    for (id in ids.values()) {
      switch (photos.get(id)) {
        case (null) {};
        case (?photo) {
          if (photo.owner == caller or isAdmin) {
            resultList.add(photo);
          };
        };
      };
    };

    resultList.toArray();
  };

  public query ({ caller }) func getSharedAlbum(shareId : Text) : async Album {
    // No authorization check - public access via share link
    switch (sharedAlbums.get(shareId)) {
      case (null) { Runtime.trap("Share link not found") };
      case (?albumId) {
        switch (albums.get(albumId)) {
          case (null) { Runtime.trap("Shared album not found") };
          case (?album) { album };
        };
      };
    };
  };

  public query ({ caller }) func getSharedPhotos(shareId : Text, photoIds : [Text]) : async [Photo] {
    // No authorization check - public access via share link
    // SECURITY: Verify that requested photos belong to the shared album
    switch (sharedAlbums.get(shareId)) {
      case (null) { Runtime.trap("Share link not found") };
      case (?albumId) {
        switch (albums.get(albumId)) {
          case (null) { Runtime.trap("Shared album not found") };
          case (?album) {
            let resultList = List.empty<Photo>();
            for (id in photoIds.values()) {
              // Check if the photo ID is in the album's photoIds
              let isInAlbum = album.photoIds.find(func(pid) { pid == id });
              switch (isInAlbum) {
                case (null) {}; // Photo not in this album, skip it
                case (?_) {
                  // Photo is in the album, fetch it
                  switch (photos.get(id)) {
                    case (null) {};
                    case (?photo) {
                      resultList.add(photo);
                    };
                  };
                };
              };
            };
            resultList.toArray();
          };
        };
      };
    };
  };

  func createDefaultAlbum(name : Text, owner : Principal) : Text {
    let id = generateId();
    let album : Album = {
      id;
      name;
      createdAt = Time.now();
      updatedAt = Time.now();
      photoIds = [];
      owner;
    };
    albums.add(id, album);
    id;
  };

  func updateAlbumWithPhoto(albumId : Text, photoId : Text) {
    switch (albums.get(albumId)) {
      case (null) { Runtime.trap("Album not found") };
      case (?album) {
        let updatedAlbum = {
          album with
          photoIds = album.photoIds.concat([photoId]);
          updatedAt = Time.now();
        };
        albums.add(albumId, updatedAlbum);
      };
    };
  };

  func generateId() : Text {
    Time.now().toText();
  };
};
