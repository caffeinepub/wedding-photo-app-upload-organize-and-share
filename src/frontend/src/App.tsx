import { createRouter, createRoute, createRootRoute, RouterProvider, Outlet } from '@tanstack/react-router';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';
import Header from './components/Header';
import AlbumListPage from './pages/AlbumListPage';
import AlbumDetailPage from './pages/AlbumDetailPage';
import SharedAlbumPage from './pages/SharedAlbumPage';
import RequireAuth from './components/RequireAuth';
import ProfileSetupDialog from './components/ProfileSetupDialog';

function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
          © 2026. Built with love using{' '}
          <a
            href="https://caffeine.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline font-medium"
          >
            caffeine.ai
          </a>
        </div>
      </footer>
      <ProfileSetupDialog />
      <Toaster />
    </div>
  );
}

const rootRoute = createRootRoute({
  component: Layout,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: () => (
    <RequireAuth>
      <AlbumListPage />
    </RequireAuth>
  ),
});

const albumDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/album/$albumId',
  component: () => (
    <RequireAuth>
      <AlbumDetailPage />
    </RequireAuth>
  ),
});

const sharedAlbumRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/shared/$shareId',
  component: SharedAlbumPage,
});

const routeTree = rootRoute.addChildren([indexRoute, albumDetailRoute, sharedAlbumRoute]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <RouterProvider router={router} />
    </ThemeProvider>
  );
}

