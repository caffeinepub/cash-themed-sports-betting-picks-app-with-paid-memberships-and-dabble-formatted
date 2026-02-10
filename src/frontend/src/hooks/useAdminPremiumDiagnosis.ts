import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';
import { Principal } from '@dfinity/principal';
import type { AdminPremiumDiagnosis } from '../backend';

export function useAdminPremiumDiagnosis(targetPrincipal: string | null) {
  const { actor, isFetching } = useActor();

  return useQuery<AdminPremiumDiagnosis>({
    queryKey: ['adminPremiumDiagnosis', targetPrincipal],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      if (!targetPrincipal) throw new Error('No target principal provided');
      
      try {
        const principal = Principal.fromText(targetPrincipal);
        return await actor.adminPremiumDiagnosis(principal);
      } catch (error: any) {
        if (error?.message?.includes('Invalid principal')) {
          throw new Error('Invalid Principal ID format');
        }
        if (error?.message?.includes('Unauthorized')) {
          throw new Error('Unauthorized: Only admins can perform diagnosis');
        }
        throw error;
      }
    },
    enabled: !!actor && !isFetching && !!targetPrincipal,
    retry: false,
  });
}
