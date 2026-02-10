import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { SubscriptionPlan } from '../backend';

export function useActivateSubscription() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ sessionId, plan }: { sessionId: string; plan: SubscriptionPlan }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.activateSubscription(sessionId, plan);
    },
    onSuccess: async () => {
      // Invalidate all premium-related queries
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      queryClient.invalidateQueries({ queryKey: ['premiumStatus'] });
      queryClient.invalidateQueries({ queryKey: ['isAdmin'] });
      
      // Actively refetch to ensure immediate UI update
      await Promise.all([
        queryClient.refetchQueries({ queryKey: ['subscription'] }),
        queryClient.refetchQueries({ queryKey: ['currentUserProfile'] }),
        queryClient.refetchQueries({ queryKey: ['premiumStatus'] }),
      ]);
    },
  });
}
