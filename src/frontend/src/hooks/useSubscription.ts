import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { SubscriptionStatus, ReferralStatus, PremiumSource, UserProfile } from '../backend';

export function useSubscription() {
  const { actor, isFetching } = useActor();

  const subscriptionQuery = useQuery<SubscriptionStatus | null>({
    queryKey: ['subscription'],
    queryFn: async () => {
      if (!actor) return null;
      return actor.checkSubscriptionStatus();
    },
    enabled: !!actor && !isFetching,
  });

  const profileQuery = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !isFetching,
  });

  const premiumSourceQuery = useQuery<PremiumSource>({
    queryKey: ['premiumStatus'],
    queryFn: async () => {
      if (!actor) return 'none' as PremiumSource;
      return actor.checkPremiumStatus();
    },
    enabled: !!actor && !isFetching,
  });

  // Use backend-reported premium source as authoritative signal
  // This ensures creator/admin principals always have access
  const hasActiveAccess = premiumSourceQuery.data !== 'none' && premiumSourceQuery.data !== undefined;

  // Keep expiry-based checks for UI details
  const hasActiveSubscription =
    subscriptionQuery.data !== null &&
    subscriptionQuery.data !== undefined &&
    Number(subscriptionQuery.data.expiresAt) > Date.now() * 1000000;

  const hasActiveReferral =
    profileQuery.data?.referral !== null &&
    profileQuery.data?.referral !== undefined &&
    Number(profileQuery.data.referral.expiresAt) > Date.now() * 1000000;

  const hasManualPremium = profileQuery.data?.hasManualPremium === true;

  // Ensure loading states are consistent
  const isLoading =
    subscriptionQuery.isLoading || profileQuery.isLoading || premiumSourceQuery.isLoading || isFetching;

  return {
    subscriptionStatus: subscriptionQuery.data,
    referralStatus: profileQuery.data?.referral,
    hasManualPremium,
    premiumSource: premiumSourceQuery.data,
    hasActiveSubscription,
    hasActiveReferral,
    hasActiveAccess,
    isLoading,
    refetch: async () => {
      await subscriptionQuery.refetch();
      await profileQuery.refetch();
      await premiumSourceQuery.refetch();
    },
  };
}
