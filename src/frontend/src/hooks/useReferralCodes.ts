import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { ReferralCodeStatus } from '../backend';

// Admin hook to list all active referral codes
export function useListReferralCodes() {
  const { actor, isFetching } = useActor();

  return useQuery<ReferralCodeStatus[]>({
    queryKey: ['referralCodes'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getActiveReferralCodes();
    },
    enabled: !!actor && !isFetching,
  });
}

// Admin hook to create a new referral code
export function useCreateReferralCode() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ code, validForNs }: { code: string; validForNs: bigint }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createReferralCode(code, validForNs);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['referralCodes'] });
    },
  });
}

// Admin hook to revoke a referral code
export function useRevokeReferralCode() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (code: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.revokeReferralCode(code);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['referralCodes'] });
    },
  });
}

// User hook to redeem a referral code
export function useRedeemReferralCode() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (code: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.redeemReferralCode(code);
    },
    onSuccess: () => {
      // Invalidate subscription and user profile queries to reflect new access
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}
