import { useState } from 'react';
import { useCreateShareLink, useRevokeShareLink } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { X, Link2, Copy, Trash2, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

interface ShareSettingsPanelProps {
  albumId: string;
  onClose: () => void;
}

export default function ShareSettingsPanel({ albumId, onClose }: ShareSettingsPanelProps) {
  const [shareId, setShareId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showRevokeDialog, setShowRevokeDialog] = useState(false);
  const createShareLink = useCreateShareLink();
  const revokeShareLink = useRevokeShareLink();

  const shareUrl = shareId
    ? `${window.location.origin}/shared/${shareId}`
    : null;

  const handleCreateLink = async () => {
    try {
      const newShareId = await createShareLink.mutateAsync(albumId);
      setShareId(newShareId);
      toast.success('Share link created successfully!');
    } catch (error) {
      toast.error('Failed to create share link. Please try again.');
      console.error('Create share link error:', error);
    }
  };

  const handleCopyLink = async () => {
    if (!shareUrl) return;

    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy link');
    }
  };

  const handleRevokeLink = async () => {
    if (!shareId) return;

    try {
      await revokeShareLink.mutateAsync(shareId);
      setShareId(null);
      setShowRevokeDialog(false);
      toast.success('Share link revoked successfully');
    } catch (error) {
      toast.error('Failed to revoke share link. Please try again.');
      console.error('Revoke share link error:', error);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>Share Album</CardTitle>
              <CardDescription>
                Create a public link to share this album with others
              </CardDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {!shareId ? (
            <div className="text-center py-6">
              <div className="w-12 h-12 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Link2 className="w-6 h-6 text-primary" />
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                No active share link for this album
              </p>
              <Button
                onClick={handleCreateLink}
                disabled={createShareLink.isPending}
                className="gap-2"
              >
                <Link2 className="w-4 h-4" />
                {createShareLink.isPending ? 'Creating...' : 'Create Share Link'}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Share Link</Label>
                <div className="flex gap-2">
                  <Input value={shareUrl || ''} readOnly className="font-mono text-sm" />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleCopyLink}
                    className="shrink-0"
                  >
                    {copied ? (
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Anyone with this link can view the photos in this album
                </p>
              </div>

              <Button
                variant="destructive"
                onClick={() => setShowRevokeDialog(true)}
                className="w-full gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Revoke Link
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={showRevokeDialog} onOpenChange={setShowRevokeDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revoke Share Link?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently disable the current share link. Anyone with the old link will
              no longer be able to access this album. You can create a new link later if needed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRevokeLink}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Revoke Link
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

