import { useState } from 'react';
import type { Photo } from '../backend';
import PhotoViewer from './PhotoViewer';
import { Card } from '@/components/ui/card';

interface PhotoGridProps {
  photos: Photo[];
  albumId?: string;
  isSharedView?: boolean;
}

export default function PhotoGrid({ photos, albumId, isSharedView = false }: PhotoGridProps) {
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {photos.map((photo, index) => {
          const imageUrl = photo.blob.getDirectURL();
          return (
            <Card
              key={photo.id}
              className="group cursor-pointer overflow-hidden hover:shadow-elegant transition-all duration-300"
              onClick={() => setSelectedPhotoIndex(index)}
            >
              <div className="aspect-square relative overflow-hidden bg-muted">
                <img
                  src={imageUrl}
                  alt={photo.caption || photo.filename}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
                {photo.caption && (
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-white text-sm line-clamp-2">{photo.caption}</p>
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {selectedPhotoIndex !== null && (
        <PhotoViewer
          photos={photos}
          initialIndex={selectedPhotoIndex}
          onClose={() => setSelectedPhotoIndex(null)}
          albumId={albumId}
          isSharedView={isSharedView}
        />
      )}
    </>
  );
}

