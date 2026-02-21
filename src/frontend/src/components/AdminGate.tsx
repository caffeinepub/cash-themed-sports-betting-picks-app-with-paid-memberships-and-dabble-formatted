import { ReactNode } from 'react';
import { useIsAdmin } from '../hooks/useAdmin';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { ShieldAlert, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AdminGateProps {
  children: ReactNode;
}

export default function AdminGate({ children }: AdminGateProps) {
  const { identity, login, isInitializing } = useInternetIdentity();
  const { data: isAdmin, isLoading, isFetched } = useIsAdmin();

  const isAuthenticated = !!identity;

  // Show loading while initializing auth or checking admin status
  if (isInitializing || isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cash-gold"></div>
      </div>
    );
  }

  // If not authenticated, prompt login
  if (!isAuthenticated) {
    return (
      <div className="container py-12">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <LogIn className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-3xl font-bold">Authentication Required</h2>
          <p className="text-muted-foreground">
            Please log in to access the admin area.
          </p>
          <Button onClick={login} size="lg" className="mt-4">
            Log In
          </Button>
        </div>
      </div>
    );
  }

  // Only show access denied after we've definitively checked admin status
  if (isFetched && !isAdmin) {
    return (
      <div className="container py-12">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-destructive/10 mb-4">
            <ShieldAlert className="h-8 w-8 text-destructive" />
          </div>
          <h2 className="text-3xl font-bold">Access Denied</h2>
          <p className="text-muted-foreground">You do not have permission to access this area.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
