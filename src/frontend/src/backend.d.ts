import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface Album {
    id: string;
    owner: Principal;
    name: string;
    createdAt: Time;
    photoIds: Array<string>;
    updatedAt: Time;
}
export type Time = bigint;
export interface UserProfile {
    name: string;
}
export interface Photo {
    id: string;
    contentType: string;
    owner: Principal;
    blob: ExternalBlob;
    createdAt: Time;
    byteSize: bigint;
    filename: string;
    caption?: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createAlbum(name: string): Promise<string>;
    createShareLink(albumId: string): Promise<string>;
    getAlbum(id: string): Promise<Album>;
    getAlbums(): Promise<Array<Album>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getPhoto(id: string): Promise<Photo>;
    getPhotos(ids: Array<string>): Promise<Array<Photo>>;
    getSharedAlbum(shareId: string): Promise<Album>;
    getSharedPhotos(shareId: string, photoIds: Array<string>): Promise<Array<Photo>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    reorderPhotos(albumId: string, newOrder: Array<string>): Promise<void>;
    revokeShareLink(shareId: string): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateAlbumName(id: string, newName: string): Promise<void>;
    updatePhotoCaption(photoId: string, caption: string): Promise<void>;
    uploadPhotos(albumId: string | null, filename: string, contentType: string, byteSize: bigint, caption: string | null, blob: ExternalBlob): Promise<string>;
}
