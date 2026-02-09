import { ReactNode } from 'react';
import { useIsAdmin } from '../hooks/useAdmin';
import { ShieldAlert } from 'lucide-react';

interface AdminGateProps {
  children: ReactNode;
}

export default function AdminGate({ children }: AdminGateProps) {
  const { data: isAdmin, isLoading } = useIsAdmin();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cash-gold"></div>
      </div>
    );
  }

  if (!isAdmin) {
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
