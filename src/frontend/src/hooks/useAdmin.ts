import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import type { Prediction } from '../backend';

export function useIsAdmin() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity, isInitializing } = useInternetIdentity();

  const query = useQuery<boolean>({
    queryKey: ['isAdmin', identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      try {
        return await actor.isCallerAdmin();
      } catch (error) {
        // If the backend traps with "Unauthorized", treat as non-admin
        // This preserves existing access restrictions for non-admin users
        return false;
      }
    },
    enabled: !!actor && !actorFetching && !isInitializing && !!identity,
    retry: false, // Don't retry on authorization errors
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  return {
    ...query,
    // Ensure loading state reflects all dependencies
    isLoading: actorFetching || isInitializing || query.isLoading,
    isFetched: !!actor && !actorFetching && !isInitializing && query.isFetched,
  };
}

export function useSetDepthChart() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async ({ key, data }: { key: string; data: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.setDepthChart(key, data);
    },
  });
}

export function useSetInjuryReport() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async ({ key, data }: { key: string; data: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.setInjuryReport(key, data);
    },
  });
}

export function useSetCoachingStyle() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async ({ key, data }: { key: string; data: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.setCoachingStyle(key, data);
    },
  });
}

export function useSetNewsFlag() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async ({ key, data }: { key: string; data: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.setNewsFlag(key, data);
    },
  });
}

export function useCreatePrediction() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (prediction: Prediction) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createPrediction(prediction);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['predictions'] });
    },
  });
}
