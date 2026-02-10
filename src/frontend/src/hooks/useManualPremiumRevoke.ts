import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { Principal } from '@dfinity/principal';

export function useManualPremiumRevoke() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userPrincipal: string) => {
      if (!actor) throw new Error('Actor not available');
      const principal = Principal.fromText(userPrincipal);
      return actor.revokeManualPremiumAccess(principal);
    },
    onSuccess: (_data, userPrincipal) => {
      // Invalidate all premium-related queries
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      queryClient.invalidateQueries({ queryKey: ['premiumStatus'] });
      // Invalidate the diagnosis cache for the affected principal
      queryClient.invalidateQueries({ queryKey: ['adminPremiumDiagnosis', userPrincipal] });
    },
  });
}
