import { useState } from 'react';
import { useUpdatePhotoCaption } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Pencil, Check, X } from 'lucide-react';
import { toast } from 'sonner';

interface PhotoCaptionEditorProps {
  photoId: string;
  currentCaption: string;
}

export default function PhotoCaptionEditor({ photoId, currentCaption }: PhotoCaptionEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [caption, setCaption] = useState(currentCaption);
  const updatePhotoCaption = useUpdatePhotoCaption();

  const handleSave = async () => {
    if (caption.trim() === currentCaption) {
      setIsEditing(false);
      return;
    }

    try {
      await updatePhotoCaption.mutateAsync({ photoId, caption: caption.trim() });
      toast.success('Caption updated successfully!');
      setIsEditing(false);
    } catch (error) {
      toast.error('Failed to update caption. Please try again.');
      console.error('Update caption error:', error);
    }
  };

  const handleCancel = () => {
    setCaption(currentCaption);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="space-y-2">
        <Label htmlFor="caption">Caption</Label>
        <Textarea
          id="caption"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="Add a caption..."
          rows={3}
          disabled={updatePhotoCaption.isPending}
        />
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={handleSave}
            disabled={updatePhotoCaption.isPending}
            className="gap-2"
          >
            <Check className="w-4 h-4" />
            Save
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleCancel}
            disabled={updatePhotoCaption.isPending}
          >
            <X className="w-4 h-4" />
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label>Caption</Label>
        <Button size="sm" variant="ghost" onClick={() => setIsEditing(true)} className="gap-2">
          <Pencil className="w-3 h-3" />
          Edit
        </Button>
      </div>
      <p className="text-sm text-muted-foreground">
        {currentCaption || 'No caption yet. Click edit to add one.'}
      </p>
    </div>
  );
}

