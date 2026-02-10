import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { LiveScore } from '../backend';

export function useGetAllLiveScores(enabled: boolean = true) {
  const { actor, isFetching } = useActor();

  return useQuery<LiveScore[]>({
    queryKey: ['liveScores', 'all'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllLiveScores();
    },
    enabled: !!actor && !isFetching && enabled,
    refetchInterval: enabled ? 1000 : false,
    refetchIntervalInBackground: false,
    staleTime: 0,
  });
}

export function useGetGamesInProgress(enabled: boolean = true) {
  const { actor, isFetching } = useActor();

  return useQuery<LiveScore[]>({
    queryKey: ['liveScores', 'inProgress'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getGamesInProgress();
    },
    enabled: !!actor && !isFetching && enabled,
    refetchInterval: enabled ? 1000 : false,
    refetchIntervalInBackground: false,
    staleTime: 0,
  });
}
