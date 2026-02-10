import { useMutation, useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { ShoppingItem, StripeConfiguration, SubscriptionPlan } from '../backend';

export type CheckoutSession = {
  id: string;
  url: string;
};

export function useCreateCheckoutSession() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async ({ items, plan }: { items: ShoppingItem[]; plan: SubscriptionPlan }): Promise<CheckoutSession> => {
      if (!actor) throw new Error('Actor not available');
      
      try {
        const baseUrl = `${window.location.protocol}//${window.location.host}`;
        const successUrl = `${baseUrl}/payment-success?plan=${plan}&session_id={CHECKOUT_SESSION_ID}`;
        const cancelUrl = `${baseUrl}/payment-failure`;
        
        const result = await actor.createCheckoutSession(items, successUrl, cancelUrl);
        
        // Defensive JSON parsing
        let session: CheckoutSession;
        try {
          session = JSON.parse(result) as CheckoutSession;
        } catch (parseError) {
          console.error('Failed to parse checkout session:', parseError);
          throw new Error('Invalid response from payment system');
        }
        
        // Validate session has required fields
        if (!session?.url || typeof session.url !== 'string' || session.url.trim() === '') {
          throw new Error('Payment system did not return a valid checkout URL');
        }
        
        return session;
      } catch (error: any) {
        // Normalize error messages
        if (error.message?.includes('Stripe needs to be first configured')) {
          throw new Error('Payment system is not configured. Please contact support.');
        }
        if (error.message?.includes('Unauthorized')) {
          throw new Error('You must be signed in to create a checkout session');
        }
        // Re-throw with original message if already normalized
        throw error;
      }
    },
  });
}

export function useIsStripeConfigured() {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['stripeConfigured'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isStripeConfigured();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSetStripeConfiguration() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (config: StripeConfiguration) => {
      if (!actor) throw new Error('Actor not available');
      return actor.setStripeConfiguration(config);
    },
  });
}
