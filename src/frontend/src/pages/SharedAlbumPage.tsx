import { useParams } from '@tanstack/react-router';
import { useGetSharedAlbum, useGetSharedPhotos } from '../hooks/useQueries';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Lock } from 'lucide-react';
import PhotoGrid from '../components/PhotoGrid';

export default function SharedAlbumPage() {
  const { shareId } = useParams({ from: '/shared/$shareId' });
  const { data: album, isLoading: albumLoading, error: albumError } = useGetSharedAlbum(shareId);
  const { data: photos, isLoading: photosLoading } = useGetSharedPhotos(shareId, album?.photoIds);

  const isLoading = albumLoading || photosLoading;

  if (albumError) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Alert variant="destructive" className="max-w-2xl mx-auto">
          <Lock className="h-5 w-5" />
          <AlertTitle className="text-lg font-semibold">Invalid or Revoked Link</AlertTitle>
          <AlertDescription className="mt-2">
            This share link is invalid or has been revoked by the album owner. Please contact them
            for a new link if you need access.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="space-y-6">
          <Skeleton className="h-10 w-64" />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="aspect-square rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!album) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Alert className="max-w-2xl mx-auto">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Album not found.</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8 space-y-2">
        <h1 className="text-3xl font-display font-bold text-foreground">{album.name}</h1>
        <p className="text-sm text-muted-foreground">
          Shared album • {photos?.length || 0} {photos?.length === 1 ? 'photo' : 'photos'}
        </p>
      </div>

      {/* Photo Grid */}
      {photos && photos.length > 0 ? (
        <PhotoGrid photos={photos} isSharedView />
      ) : (
        <div className="text-center py-16">
          <p className="text-muted-foreground">This album is empty.</p>
        </div>
      )}
    </div>
  );
}

