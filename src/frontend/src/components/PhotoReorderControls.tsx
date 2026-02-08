import { useReorderPhotos } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { toast } from 'sonner';
import type { Photo } from '../backend';

interface PhotoReorderControlsProps {
  albumId: string;
  photos: Photo[];
  currentIndex: number;
  onReorder: (newIndex: number) => void;
}

export default function PhotoReorderControls({
  albumId,
  photos,
  currentIndex,
  onReorder,
}: PhotoReorderControlsProps) {
  const reorderPhotos = useReorderPhotos();

  const canMoveUp = currentIndex > 0;
  const canMoveDown = currentIndex < photos.length - 1;

  const handleMove = async (direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    const newOrder = [...photos];
    const [movedPhoto] = newOrder.splice(currentIndex, 1);
    newOrder.splice(newIndex, 0, movedPhoto);

    try {
      await reorderPhotos.mutateAsync({
        albumId,
        newOrder: newOrder.map((p) => p.id),
      });
      onReorder(newIndex);
      toast.success('Photo order updated!');
    } catch (error) {
      toast.error('Failed to reorder photos. Please try again.');
      console.error('Reorder error:', error);
    }
  };

  if (photos.length <= 1) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground">Reorder:</span>
      <Button
        size="sm"
        variant="outline"
        onClick={() => handleMove('up')}
        disabled={!canMoveUp || reorderPhotos.isPending}
        className="gap-2"
      >
        <ArrowUp className="w-4 h-4" />
        Move Up
      </Button>
      <Button
        size="sm"
        variant="outline"
        onClick={() => handleMove('down')}
        disabled={!canMoveDown || reorderPhotos.isPending}
        className="gap-2"
      >
        <ArrowDown className="w-4 h-4" />
        Move Down
      </Button>
    </div>
  );
}

