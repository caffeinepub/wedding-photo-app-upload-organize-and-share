import { useState } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { useGetAlbum, useGetPhotos } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, AlertCircle, Upload, Share2 } from 'lucide-react';
import PhotoGrid from '../components/PhotoGrid';
import PhotoUploadPanel from '../components/PhotoUploadPanel';
import ShareSettingsPanel from '../components/ShareSettingsPanel';
import AlbumNameEditor from '../components/AlbumNameEditor';

export default function AlbumDetailPage() {
  const { albumId } = useParams({ from: '/album/$albumId' });
  const navigate = useNavigate();
  const { data: album, isLoading: albumLoading, error: albumError } = useGetAlbum(albumId);
  const { data: photos, isLoading: photosLoading } = useGetPhotos(album?.photoIds);
  const [showUpload, setShowUpload] = useState(false);
  const [showShare, setShowShare] = useState(false);

  const isLoading = albumLoading || photosLoading;

  if (albumError) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load album. Please check the URL and try again.
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
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Album not found.</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8 space-y-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate({ to: '/' })}
          className="gap-2 -ml-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Albums
        </Button>

        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <AlbumNameEditor albumId={album.id} currentName={album.name} />
            <p className="text-sm text-muted-foreground mt-2">
              {photos?.length || 0} {photos?.length === 1 ? 'photo' : 'photos'}
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowShare(!showShare)}
              className="gap-2"
            >
              <Share2 className="w-4 h-4" />
              Share
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={() => setShowUpload(!showUpload)}
              className="gap-2"
            >
              <Upload className="w-4 h-4" />
              Upload
            </Button>
          </div>
        </div>
      </div>

      {/* Upload Panel */}
      {showUpload && (
        <div className="mb-8">
          <PhotoUploadPanel albumId={album.id} onClose={() => setShowUpload(false)} />
        </div>
      )}

      {/* Share Panel */}
      {showShare && (
        <div className="mb-8">
          <ShareSettingsPanel albumId={album.id} onClose={() => setShowShare(false)} />
        </div>
      )}

      {/* Photo Grid */}
      {photos && photos.length > 0 ? (
        <PhotoGrid photos={photos} albumId={album.id} />
      ) : (
        <div className="text-center py-16">
          <div className="w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center mb-4">
            <Upload className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="font-semibold text-lg mb-2">No photos yet</h3>
          <p className="text-muted-foreground mb-6">
            Upload your first photo to start building this album.
          </p>
          <Button onClick={() => setShowUpload(true)} className="gap-2">
            <Upload className="w-4 h-4" />
            Upload Photos
          </Button>
        </div>
      )}
    </div>
  );
}

