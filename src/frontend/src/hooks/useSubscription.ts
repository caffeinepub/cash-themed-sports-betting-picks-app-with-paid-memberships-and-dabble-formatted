import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { SubscriptionStatus, ReferralStatus } from '../backend';

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

  const profileQuery = useQuery<{ referral?: ReferralStatus } | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !isFetching,
  });

  const hasActiveSubscription =
    subscriptionQuery.data !== null &&
    subscriptionQuery.data !== undefined &&
    Number(subscriptionQuery.data.expiresAt) > Date.now() * 1000000;

  const hasActiveReferral =
    profileQuery.data?.referral !== null &&
    profileQuery.data?.referral !== undefined &&
    Number(profileQuery.data.referral.expiresAt) > Date.now() * 1000000;

  const hasActiveAccess = hasActiveSubscription || hasActiveReferral;

  return {
    subscriptionStatus: subscriptionQuery.data,
    referralStatus: profileQuery.data?.referral,
    hasActiveSubscription,
    hasActiveReferral,
    hasActiveAccess,
    isLoading: subscriptionQuery.isLoading || profileQuery.isLoading,
  };
}
