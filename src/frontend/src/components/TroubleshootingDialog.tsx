import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Copy, RefreshCw, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { copyAppLinkToClipboard } from '../utils/appLink';

interface TroubleshootingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function TroubleshootingDialog({ open, onOpenChange }: TroubleshootingDialogProps) {
  const [copying, setCopying] = useState(false);

  const handleCopyLink = async () => {
    setCopying(true);
    const success = await copyAppLinkToClipboard();
    setCopying(false);

    if (success) {
      toast.success('App link copied to clipboard');
    } else {
      toast.error('Failed to copy link. Please try again.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-primary" />
            Help & Troubleshooting
          </DialogTitle>
          <DialogDescription>
            Having trouble accessing the app? Here are some solutions.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Copy App Link Section */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <Copy className="w-4 h-4" />
              Share or Save App Link
            </h3>
            <p className="text-sm text-muted-foreground">
              Copy the current app URL to share with others or save for later access.
            </p>
            <Button
              onClick={handleCopyLink}
              disabled={copying}
              variant="outline"
              className="w-full"
            >
              <Copy className="w-4 h-4 mr-2" />
              {copying ? 'Copying...' : 'Copy App Link'}
            </Button>
          </div>

          {/* Hard Refresh Section */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <RefreshCw className="w-4 h-4" />
              App Not Loading?
            </h3>
            <p className="text-sm text-muted-foreground">
              If the app fails to load or shows errors, try a hard refresh to clear cached data:
            </p>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside ml-2">
              <li>
                <strong>Windows/Linux:</strong> Press <kbd className="px-1.5 py-0.5 text-xs bg-muted rounded">Ctrl</kbd> + <kbd className="px-1.5 py-0.5 text-xs bg-muted rounded">Shift</kbd> + <kbd className="px-1.5 py-0.5 text-xs bg-muted rounded">R</kbd>
              </li>
              <li>
                <strong>Mac:</strong> Press <kbd className="px-1.5 py-0.5 text-xs bg-muted rounded">Cmd</kbd> + <kbd className="px-1.5 py-0.5 text-xs bg-muted rounded">Shift</kbd> + <kbd className="px-1.5 py-0.5 text-xs bg-muted rounded">R</kbd>
              </li>
              <li>
                <strong>Alternative:</strong> Press <kbd className="px-1.5 py-0.5 text-xs bg-muted rounded">Ctrl</kbd>/<kbd className="px-1.5 py-0.5 text-xs bg-muted rounded">Cmd</kbd> + <kbd className="px-1.5 py-0.5 text-xs bg-muted rounded">F5</kbd>
              </li>
            </ul>
          </div>

          {/* Canister Upgrade Section */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Temporary Unavailability
            </h3>
            <p className="text-sm text-muted-foreground">
              If the app is being upgraded or maintained, it may be temporarily unavailable. 
              Please wait a few moments and try refreshing the page. Upgrades typically complete within 1-2 minutes.
            </p>
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={() => onOpenChange(false)} variant="default">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
