import { useEffect, useState } from 'react';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, ArrowRight, AlertCircle, LogIn } from 'lucide-react';
import { toast } from 'sonner';
import { useActivateSubscription } from '../hooks/useActivateSubscription';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { SubscriptionPlan } from '../backend';
import { getPersistedUrlParameter, storeSessionParameter, clearSessionParameter } from '../utils/urlParams';

export default function PaymentSuccessPage() {
  const navigate = useNavigate();
  const search = useSearch({ from: '/payment-success' }) as { plan?: string; session_id?: string };
  const { identity, login } = useInternetIdentity();
  const activateSubscription = useActivateSubscription();
  const [activationStatus, setActivationStatus] = useState<'pending' | 'success' | 'error' | 'needsAuth'>('pending');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const isAuthenticated = !!identity;

  useEffect(() => {
    // Persist URL params to sessionStorage
    if (search.plan) {
      storeSessionParameter('payment_plan', search.plan);
    }
    if (search.session_id) {
      storeSessionParameter('payment_session_id', search.session_id);
    }
  }, [search.plan, search.session_id]);

  useEffect(() => {
    const activateAccess = async () => {
      // Get params from URL or sessionStorage
      const sessionId = getPersistedUrlParameter('session_id', 'payment_session_id');
      const planParam = getPersistedUrlParameter('plan', 'payment_plan');

      // Check if params are missing
      if (!sessionId || !planParam) {
        setActivationStatus('error');
        setErrorMessage(
          'Payment information is missing. Your payment may have been processed. Please use "Restore Premium Access" from your Account page to activate your subscription.'
        );
        toast.error('Payment information missing');
        return;
      }

      // Check if user is authenticated
      if (!isAuthenticated) {
        setActivationStatus('needsAuth');
        return;
      }

      const plan: SubscriptionPlan = planParam === 'yearly' ? SubscriptionPlan.yearly : SubscriptionPlan.monthly;

      try {
        await activateSubscription.mutateAsync({ sessionId, plan });
        setActivationStatus('success');
        toast.success('Payment successful! Your subscription is now active.');
        // Clear stored params after successful activation
        clearSessionParameter('payment_plan');
        clearSessionParameter('payment_session_id');
      } catch (error: any) {
        console.error('Activation error:', error);
        setActivationStatus('error');
        setErrorMessage(
          error?.message || 'Failed to activate subscription. Please use "Restore Premium Access" from your Account page.'
        );
        toast.error('Failed to activate subscription');
      }
    };

    activateAccess();
  }, [isAuthenticated, activateSubscription]);

  const handleRetryActivation = async () => {
    setActivationStatus('pending');
    // The useEffect will trigger activation again
  };

  const handleSignIn = async () => {
    try {
      await login();
      // After login, the useEffect will trigger and attempt activation
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Failed to sign in');
    }
  };

  if (activationStatus === 'needsAuth') {
    return (
      <div className="container py-12">
        <div className="max-w-2xl mx-auto">
          <Card className="border-cash-gold/30">
            <CardHeader className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-cash-gold/10 mx-auto mb-4">
                <LogIn className="h-10 w-10 text-cash-gold" />
              </div>
              <CardTitle className="text-3xl">Sign In Required</CardTitle>
              <CardDescription className="text-lg">
                Please sign in to activate your subscription
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 text-center">
              <p className="text-muted-foreground">
                Your payment has been processed successfully. To activate your subscription, please sign in with your
                Internet Identity account.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={handleSignIn}
                  className="bg-gradient-to-r from-cash-green to-cash-gold hover:opacity-90 text-black font-semibold"
                >
                  <LogIn className="h-4 w-4 mr-2" />
                  Sign In to Activate
                </Button>
                <Button variant="outline" onClick={() => navigate({ to: '/pricing' })}>
                  Back to Pricing
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (activationStatus === 'pending') {
    return (
      <div className="container py-12">
        <div className="max-w-2xl mx-auto text-center">
          <Card className="border-cash-gold/30">
            <CardHeader>
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-cash-gold/10 mx-auto mb-4">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-cash-gold"></div>
              </div>
              <CardTitle className="text-3xl">Activating Your Subscription</CardTitle>
              <CardDescription className="text-lg">Please wait while we process your payment...</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    );
  }

  if (activationStatus === 'error') {
    return (
      <div className="container py-12">
        <div className="max-w-2xl mx-auto">
          <Card className="border-destructive/30">
            <CardHeader className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-destructive/10 mx-auto mb-4">
                <AlertCircle className="h-10 w-10 text-destructive" />
              </div>
              <CardTitle className="text-3xl">Activation Error</CardTitle>
              <CardDescription className="text-lg">{errorMessage}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 text-center">
              <p className="text-muted-foreground">
                Your payment may have been processed, but we couldn't activate your subscription automatically.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={() => navigate({ to: '/account' })}
                  className="bg-gradient-to-r from-cash-green to-cash-gold hover:opacity-90 text-black font-semibold"
                >
                  Go to Account
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
                <Button variant="outline" onClick={handleRetryActivation}>
                  Retry Activation
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-12">
      <div className="max-w-2xl mx-auto">
        <Card className="border-cash-gold/30">
          <CardHeader className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-cash-gold/10 mx-auto mb-4">
              <CheckCircle className="h-10 w-10 text-cash-gold" />
            </div>
            <CardTitle className="text-3xl">Payment Successful!</CardTitle>
            <CardDescription className="text-lg">Your subscription is now active</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 text-center">
            <p className="text-muted-foreground">
              Thank you for subscribing to CashPicks! You now have full access to all premium predictions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => navigate({ to: '/predictions' })}
                className="bg-gradient-to-r from-cash-green to-cash-gold hover:opacity-90 text-black font-semibold"
              >
                View Predictions
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
              <Button variant="outline" onClick={() => navigate({ to: '/account' })}>
                Go to Account
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
