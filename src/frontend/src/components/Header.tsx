import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { Heart, Copy, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import AuthButton from './AuthButton';
import TroubleshootingDialog from './TroubleshootingDialog';
import { useAuthz } from '../hooks/useAuthz';
import { copyAppLinkToClipboard } from '../utils/appLink';

export default function Header() {
  const { isAuthenticated, displayName } = useAuthz();
  const [copying, setCopying] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);

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
    <>
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <Heart className="w-5 h-5 text-primary fill-primary" />
            </div>
            <div className="flex flex-col">
              <span className="font-display text-xl font-semibold text-foreground tracking-tight">
                Our Wedding
              </span>
              <span className="text-xs text-muted-foreground">Photo Collection</span>
            </div>
          </Link>

          <div className="flex items-center gap-2 sm:gap-4">
            {isAuthenticated && (
              <span className="text-sm text-muted-foreground hidden sm:inline">
                Welcome, <span className="text-foreground font-medium">{displayName}</span>
              </span>
            )}
            
            <Button
              onClick={handleCopyLink}
              disabled={copying}
              variant="ghost"
              size="sm"
              className="gap-2"
            >
              <Copy className="w-4 h-4" />
              <span className="hidden sm:inline">Copy App Link</span>
            </Button>

            <Button
              onClick={() => setHelpOpen(true)}
              variant="ghost"
              size="sm"
              className="gap-2"
            >
              <HelpCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Help</span>
            </Button>

            <AuthButton />
          </div>
        </div>
      </header>

      <TroubleshootingDialog open={helpOpen} onOpenChange={setHelpOpen} />
    </>
  );
}
