import { ReactNode } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useSubscription } from '../hooks/useSubscription';
import SubscribeCta from './SubscribeCta';
import { Lock } from 'lucide-react';

interface PremiumGateProps {
  children: ReactNode;
  showPreview?: boolean;
}

export default function PremiumGate({ children, showPreview = false }: PremiumGateProps) {
  const { identity } = useInternetIdentity();
  const { hasActiveSubscription, isLoading } = useSubscription();

  const isAuthenticated = !!identity;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cash-gold"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="container py-12">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-cash-gold/10 mb-4">
            <Lock className="h-8 w-8 text-cash-gold" />
          </div>
          <h2 className="text-3xl font-bold">Premium Content</h2>
          <p className="text-muted-foreground">
            Please sign in to access our AI-powered sports betting predictions.
          </p>
          {showPreview && <div className="opacity-50 pointer-events-none blur-sm">{children}</div>}
        </div>
      </div>
    );
  }

  if (!hasActiveSubscription) {
    return <SubscribeCta />;
  }

  return <>{children}</>;
}
