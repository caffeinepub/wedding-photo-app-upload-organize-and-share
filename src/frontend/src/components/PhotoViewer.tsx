import { useState, useEffect } from 'react';
import type { Photo } from '../backend';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Download, X } from 'lucide-react';
import PhotoCaptionEditor from './PhotoCaptionEditor';
import PhotoReorderControls from './PhotoReorderControls';

interface PhotoViewerProps {
  photos: Photo[];
  initialIndex: number;
  onClose: () => void;
  albumId?: string;
  isSharedView?: boolean;
}

export default function PhotoViewer({
  photos,
  initialIndex,
  onClose,
  albumId,
  isSharedView = false,
}: PhotoViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const currentPhoto = photos[currentIndex];

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : photos.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < photos.length - 1 ? prev + 1 : 0));
  };

  const handleDownload = async () => {
    try {
      const imageUrl = currentPhoto.blob.getDirectURL();
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = currentPhoto.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') handlePrevious();
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, photos.length]);

  const imageUrl = currentPhoto.blob.getDirectURL();
  const createdDate = new Date(Number(currentPhoto.createdAt) / 1000000);

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-6xl w-full h-[90vh] p-0 gap-0">
        <div className="flex flex-col h-full">
          {/* Header */}
          <DialogHeader className="px-6 py-4 border-b border-border">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <DialogTitle className="truncate">{currentPhoto.filename}</DialogTitle>
                <DialogDescription className="mt-1">
                  {createdDate.toLocaleDateString()} • Photo {currentIndex + 1} of {photos.length}
                </DialogDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={handleDownload}>
                  <Download className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={onClose}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </DialogHeader>

          {/* Image */}
          <div className="flex-1 relative bg-black/5 flex items-center justify-center p-4 overflow-hidden">
            <img
              src={imageUrl}
              alt={currentPhoto.caption || currentPhoto.filename}
              className="max-w-full max-h-full object-contain"
            />

            {/* Navigation Buttons */}
            {photos.length > 1 && (
              <>
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full shadow-lg"
                  onClick={handlePrevious}
                >
                  <ChevronLeft className="w-5 h-5" />
                </Button>
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full shadow-lg"
                  onClick={handleNext}
                >
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </>
            )}
          </div>

          {/* Footer with Caption and Controls */}
          <div className="px-6 py-4 border-t border-border space-y-4">
            {!isSharedView && (
              <>
                <PhotoCaptionEditor
                  photoId={currentPhoto.id}
                  currentCaption={currentPhoto.caption || ''}
                />
                {albumId && (
                  <PhotoReorderControls
                    albumId={albumId}
                    photos={photos}
                    currentIndex={currentIndex}
                    onReorder={(newIndex) => setCurrentIndex(newIndex)}
                  />
                )}
              </>
            )}
            {isSharedView && currentPhoto.caption && (
              <div className="text-sm text-muted-foreground">
                <p className="font-medium text-foreground mb-1">Caption</p>
                <p>{currentPhoto.caption}</p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

