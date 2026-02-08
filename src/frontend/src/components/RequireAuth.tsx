import { ReactNode } from 'react';
import { useAuthz } from '../hooks/useAuthz';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, Lock } from 'lucide-react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';

interface RequireAuthProps {
  children: ReactNode;
}

export default function RequireAuth({ children }: RequireAuthProps) {
  const { isAuthenticated, loginStatus } = useAuthz();
  const { login } = useInternetIdentity();

  if (loginStatus === 'initializing') {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
            <Heart className="w-8 h-8 text-primary fill-primary animate-pulse" />
          </div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <Card className="max-w-md w-full shadow-elegant">
          <CardHeader className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
              <Lock className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="font-display text-2xl">Sign In Required</CardTitle>
            <CardDescription>
              Please sign in to view and manage your wedding photo collection.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center pb-6">
            <Button onClick={login} size="lg" className="gap-2">
              <Heart className="w-4 h-4" />
              Sign In to Continue
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}

