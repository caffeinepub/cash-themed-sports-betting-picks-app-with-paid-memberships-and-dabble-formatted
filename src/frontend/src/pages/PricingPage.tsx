import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useCreateCheckoutSession, useIsStripeConfigured } from '../hooks/useStripeCheckout';
import { getTermsAcceptance } from '../utils/termsAcceptance';
import { toast } from 'sonner';
import { Check, Sparkles, AlertCircle } from 'lucide-react';
import ResponsibleGamblingDisclaimer from '../components/ResponsibleGamblingDisclaimer';
import { SubscriptionPlan } from '../backend';

export default function PricingPage() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const createCheckout = useCreateCheckoutSession();
  const { data: isStripeConfigured, isLoading: stripeConfigLoading } = useIsStripeConfigured();
  const [processingPlan, setProcessingPlan] = useState<'monthly' | 'yearly' | null>(null);

  const isAuthenticated = !!identity;

  const handleSubscribe = async (plan: 'monthly' | 'yearly') => {
    if (!isAuthenticated) {
      toast.error('Please sign in to subscribe');
      return;
    }

    const termsAcceptance = getTermsAcceptance();
    if (!termsAcceptance.accepted) {
      toast.error('Please accept the Terms of Service first');
      navigate({ to: '/terms' });
      return;
    }

    if (!isStripeConfigured) {
      toast.error('Payment system is not configured. Please contact support.');
      return;
    }

    setProcessingPlan(plan);

    const items =
      plan === 'monthly'
        ? [
            {
              productName: 'CashPicks Monthly Subscription',
              productDescription: 'Monthly access to AI-powered sports betting predictions',
              priceInCents: BigInt(2500),
              currency: 'usd',
              quantity: BigInt(1),
            },
          ]
        : [
            {
              productName: 'CashPicks Yearly Subscription',
              productDescription: 'Yearly access to AI-powered sports betting predictions',
              priceInCents: BigInt(25000),
              currency: 'usd',
              quantity: BigInt(1),
            },
          ];

    try {
      const subscriptionPlan: SubscriptionPlan = plan === 'monthly' ? SubscriptionPlan.monthly : SubscriptionPlan.yearly;
      const session = await createCheckout.mutateAsync({ items, plan: subscriptionPlan });
      if (!session?.url) {
        throw new Error('Stripe session missing url');
      }
      window.location.href = session.url;
    } catch (error: any) {
      console.error('Checkout error:', error);
      const errorMessage = error?.message || 'Failed to create checkout session';
      toast.error(errorMessage);
      setProcessingPlan(null);
    }
  };

  return (
    <div className="container py-12">
      <div className="max-w-5xl mx-auto space-y-12">
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold">Choose Your Plan</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Get unlimited access to AI-powered predictions with transparent analysis
          </p>
        </div>

        {!stripeConfigLoading && !isStripeConfigured && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Payment System Unavailable</AlertTitle>
            <AlertDescription>
              The payment system is currently not configured. Please contact support to enable subscriptions.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="border-cash-gold/30 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-cash-gold/5 rounded-full blur-2xl"></div>
            <CardHeader className="relative">
              <CardTitle className="text-3xl">Monthly</CardTitle>
              <CardDescription>Perfect for trying out our service</CardDescription>
            </CardHeader>
            <CardContent className="relative space-y-6">
              <div className="space-y-2">
                <div className="text-6xl font-bold text-cash-gold">$25</div>
                <div className="text-muted-foreground">per month</div>
              </div>
              <ul className="space-y-3">
                <li className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-cash-gold" />
                  <span>Unlimited predictions</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-cash-gold" />
                  <span>All sports covered</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-cash-gold" />
                  <span>Dabble format export</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-cash-gold" />
                  <span>Daily updates</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-cash-gold" />
                  <span>Comprehensive analysis</span>
                </li>
              </ul>
              <Button
                onClick={() => handleSubscribe('monthly')}
                disabled={!isAuthenticated || processingPlan !== null || !isStripeConfigured}
                className="w-full bg-gradient-to-r from-cash-green to-cash-gold hover:opacity-90 text-black font-semibold"
              >
                {processingPlan === 'monthly' ? (
                  'Processing...'
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Subscribe Monthly
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          <Card className="border-cash-gold/50 relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-gradient-to-br from-cash-green to-cash-gold text-black text-xs font-bold px-4 py-1.5 rounded-bl-lg">
              BEST VALUE
            </div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-cash-gold/10 rounded-full blur-2xl"></div>
            <CardHeader className="relative">
              <CardTitle className="text-3xl">Yearly</CardTitle>
              <CardDescription>Save over 15% with annual billing</CardDescription>
            </CardHeader>
            <CardContent className="relative space-y-6">
              <div className="space-y-2">
                <div className="text-6xl font-bold text-cash-gold">$250</div>
                <div className="text-muted-foreground">per year</div>
                <div className="text-sm font-semibold text-cash-green">Save $50 compared to monthly</div>
              </div>
              <ul className="space-y-3">
                <li className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-cash-gold" />
                  <span>Unlimited predictions</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-cash-gold" />
                  <span>All sports covered</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-cash-gold" />
                  <span>Dabble format export</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-cash-gold" />
                  <span>Daily updates</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-cash-gold" />
                  <span>Comprehensive analysis</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-cash-gold" />
                  <span>Priority support</span>
                </li>
              </ul>
              <Button
                onClick={() => handleSubscribe('yearly')}
                disabled={!isAuthenticated || processingPlan !== null || !isStripeConfigured}
                className="w-full bg-gradient-to-r from-cash-green to-cash-gold hover:opacity-90 text-black font-semibold"
              >
                {processingPlan === 'yearly' ? (
                  'Processing...'
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Subscribe Yearly
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {!isAuthenticated && (
          <div className="text-center text-muted-foreground">
            <p>Please sign in to subscribe to a plan</p>
          </div>
        )}

        <ResponsibleGamblingDisclaimer />
      </div>
    </div>
  );
}
