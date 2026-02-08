import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { Album, Photo, UserProfile } from '../backend';
import { ExternalBlob } from '../backend';

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

export function useGetAlbums() {
  const { actor, isFetching } = useActor();

  return useQuery<Album[]>({
    queryKey: ['albums'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAlbums();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAlbum(albumId: string | undefined) {
  const { actor, isFetching } = useActor();

  return useQuery<Album | null>({
    queryKey: ['album', albumId],
    queryFn: async () => {
      if (!actor || !albumId) return null;
      return actor.getAlbum(albumId);
    },
    enabled: !!actor && !isFetching && !!albumId,
  });
}

export function useGetPhotos(photoIds: string[] | undefined) {
  const { actor, isFetching } = useActor();

  return useQuery<Photo[]>({
    queryKey: ['photos', photoIds],
    queryFn: async () => {
      if (!actor || !photoIds || photoIds.length === 0) return [];
      return actor.getPhotos(photoIds);
    },
    enabled: !!actor && !isFetching && !!photoIds && photoIds.length > 0,
  });
}

export function useCreateAlbum() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (name: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createAlbum(name);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['albums'] });
    },
  });
}

export function useUpdateAlbumName() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ albumId, newName }: { albumId: string; newName: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateAlbumName(albumId, newName);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['albums'] });
      queryClient.invalidateQueries({ queryKey: ['album', variables.albumId] });
    },
  });
}

export function useUploadPhoto() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      albumId,
      filename,
      contentType,
      byteSize,
      caption,
      blob,
    }: {
      albumId: string | null;
      filename: string;
      contentType: string;
      byteSize: bigint;
      caption: string | null;
      blob: ExternalBlob;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.uploadPhotos(albumId, filename, contentType, byteSize, caption, blob);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['albums'] });
      if (variables.albumId) {
        queryClient.invalidateQueries({ queryKey: ['album', variables.albumId] });
        queryClient.invalidateQueries({ queryKey: ['photos'] });
      }
    },
  });
}

export function useUpdatePhotoCaption() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ photoId, caption }: { photoId: string; caption: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updatePhotoCaption(photoId, caption);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['photos'] });
    },
  });
}

export function useReorderPhotos() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ albumId, newOrder }: { albumId: string; newOrder: string[] }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.reorderPhotos(albumId, newOrder);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['album', variables.albumId] });
    },
  });
}

export function useCreateShareLink() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (albumId: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createShareLink(albumId);
    },
  });
}

export function useRevokeShareLink() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (shareId: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.revokeShareLink(shareId);
    },
  });
}

export function useGetSharedAlbum(shareId: string | undefined) {
  const { actor, isFetching } = useActor();

  return useQuery<Album | null>({
    queryKey: ['sharedAlbum', shareId],
    queryFn: async () => {
      if (!actor || !shareId) return null;
      return actor.getSharedAlbum(shareId);
    },
    enabled: !!actor && !isFetching && !!shareId,
    retry: false,
  });
}

export function useGetSharedPhotos(shareId: string | undefined, photoIds: string[] | undefined) {
  const { actor, isFetching } = useActor();

  return useQuery<Photo[]>({
    queryKey: ['sharedPhotos', shareId, photoIds],
    queryFn: async () => {
      if (!actor || !shareId || !photoIds || photoIds.length === 0) return [];
      return actor.getSharedPhotos(shareId, photoIds);
    },
    enabled: !!actor && !isFetching && !!shareId && !!photoIds && photoIds.length > 0,
  });
}

