import { useState } from 'react';
import { useUpdateAlbumName } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Pencil, Check, X } from 'lucide-react';
import { toast } from 'sonner';

interface AlbumNameEditorProps {
  albumId: string;
  currentName: string;
}

export default function AlbumNameEditor({ albumId, currentName }: AlbumNameEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(currentName);
  const updateAlbumName = useUpdateAlbumName();

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error('Album name cannot be empty');
      return;
    }

    if (name.trim() === currentName) {
      setIsEditing(false);
      return;
    }

    try {
      await updateAlbumName.mutateAsync({ albumId, newName: name.trim() });
      toast.success('Album name updated successfully!');
      setIsEditing(false);
    } catch (error) {
      toast.error('Failed to update album name. Please try again.');
      console.error('Update album name error:', error);
    }
  };

  const handleCancel = () => {
    setName(currentName);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-2">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSave();
            if (e.key === 'Escape') handleCancel();
          }}
          className="text-2xl font-display font-bold h-auto py-1"
          autoFocus
          disabled={updateAlbumName.isPending}
        />
        <Button
          size="icon"
          variant="ghost"
          onClick={handleSave}
          disabled={updateAlbumName.isPending}
        >
          <Check className="w-4 h-4" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          onClick={handleCancel}
          disabled={updateAlbumName.isPending}
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 group">
      <h1 className="text-3xl font-display font-bold text-foreground">{currentName}</h1>
      <Button
        size="icon"
        variant="ghost"
        onClick={() => setIsEditing(true)}
        className="opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <Pencil className="w-4 h-4" />
      </Button>
    </div>
  );
}

