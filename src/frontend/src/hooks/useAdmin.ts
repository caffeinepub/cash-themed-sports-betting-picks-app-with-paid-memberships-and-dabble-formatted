import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { Prediction } from '../backend';

export function useIsAdmin() {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['isAdmin'],
    queryFn: async () => {
      if (!actor) return false;
      try {
        return await actor.isCallerAdmin();
      } catch (error) {
        return false;
      }
    },
    enabled: !!actor && !isFetching,
  });
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
