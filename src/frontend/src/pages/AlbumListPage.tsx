import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { useGetAlbums, useCreateAlbum } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Plus, Image, Heart, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function AlbumListPage() {
  const { data: albums, isLoading, error } = useGetAlbums();
  const createAlbum = useCreateAlbum();
  const [newAlbumName, setNewAlbumName] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleCreateAlbum = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAlbumName.trim()) {
      toast.error('Please enter an album name');
      return;
    }

    try {
      await createAlbum.mutateAsync(newAlbumName.trim());
      toast.success('Album created successfully!');
      setNewAlbumName('');
      setDialogOpen(false);
    } catch (error) {
      toast.error('Failed to create album. Please try again.');
      console.error('Create album error:', error);
    }
  };

  return (
    <div className="min-h-[calc(100vh-8rem)]">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-primary/5 via-background to-accent/5 border-b border-border">
        <div className="absolute inset-0 bg-[url('/assets/generated/wedding-hero-bg.dim_1920x800.png')] bg-cover bg-center opacity-10" />
        <div className="relative container mx-auto px-4 py-16 text-center">
          <div className="max-w-2xl mx-auto space-y-4 animate-slide-up">
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground tracking-tight">
              Our Wedding Memories
            </h1>
            <p className="text-lg text-muted-foreground">
              A beautiful collection of moments from our special day
            </p>
          </div>
        </div>
      </div>

      {/* Albums Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-display font-semibold text-foreground">Albums</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Organize your photos into beautiful collections
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                New Album
              </Button>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={handleCreateAlbum}>
                <DialogHeader>
                  <DialogTitle>Create New Album</DialogTitle>
                  <DialogDescription>
                    Give your album a name to start organizing your photos.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="album-name">Album Name</Label>
                    <Input
                      id="album-name"
                      placeholder="e.g., Ceremony, Reception, Portraits"
                      value={newAlbumName}
                      onChange={(e) => setNewAlbumName(e.target.value)}
                      disabled={createAlbum.isPending}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={createAlbum.isPending}>
                    {createAlbum.isPending ? 'Creating...' : 'Create Album'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-48 w-full rounded-md" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Error State */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to load albums. Please try refreshing the page.
            </AlertDescription>
          </Alert>
        )}

        {/* Empty State */}
        {!isLoading && !error && albums && albums.length === 0 && (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <Image className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-lg mb-2">No albums yet</h3>
              <p className="text-muted-foreground mb-6 max-w-sm">
                Create your first album to start organizing your wedding photos.
              </p>
              <Button onClick={() => setDialogOpen(true)} className="gap-2">
                <Plus className="w-4 h-4" />
                Create Your First Album
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Albums Grid */}
        {!isLoading && !error && albums && albums.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {albums.map((album) => (
              <Link key={album.id} to="/album/$albumId" params={{ albumId: album.id }}>
                <Card className="group hover:shadow-elegant transition-all duration-300 cursor-pointer h-full">
                  <CardHeader>
                    <CardTitle className="font-display group-hover:text-primary transition-colors">
                      {album.name}
                    </CardTitle>
                    <CardDescription>
                      {album.photoIds.length} {album.photoIds.length === 1 ? 'photo' : 'photos'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="aspect-video bg-gradient-to-br from-primary/10 to-accent/10 rounded-md flex items-center justify-center group-hover:from-primary/20 group-hover:to-accent/20 transition-colors">
                      {album.photoIds.length > 0 ? (
                        <Heart className="w-12 h-12 text-primary/40 fill-primary/20" />
                      ) : (
                        <Image className="w-12 h-12 text-muted-foreground/40" />
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

