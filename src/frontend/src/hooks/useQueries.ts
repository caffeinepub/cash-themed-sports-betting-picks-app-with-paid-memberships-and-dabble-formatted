import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { Prediction, SportsCategory } from '../backend';

export function useGetAllPredictions() {
  const { actor, isFetching } = useActor();

  return useQuery<Prediction[]>({
    queryKey: ['predictions', 'all'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllPredictions();
    },
    enabled: !!actor && !isFetching,
  });
}

function createSportVariant(sport: string): SportsCategory {
  switch (sport) {
    case 'nba':
      return { __kind__: 'nba', nba: null };
    case 'nfl':
      return { __kind__: 'nfl', nfl: null };
    case 'mlb':
      return { __kind__: 'mlb', mlb: null };
    case 'nhl':
      return { __kind__: 'nhl', nhl: null };
    case 'ncaaf':
      return { __kind__: 'ncaaf', ncaaf: null };
    case 'ncaabb':
      return { __kind__: 'ncaabb', ncaabb: null };
    case 'soccer':
      return { __kind__: 'soccer', soccer: null };
    default:
      return { __kind__: 'other', other: sport };
  }
}

export function useGetPredictionsBySport(sport: string) {
  const { actor, isFetching } = useActor();

  return useQuery<Prediction[]>({
    queryKey: ['predictions', 'sport', sport],
    queryFn: async () => {
      if (!actor || sport === 'all') return [];
      const sportVariant = createSportVariant(sport);
      return actor.getPredictionsBySport(sportVariant);
    },
    enabled: !!actor && !isFetching && sport !== 'all',
  });
}

export function useGetPrediction(id: string) {
  const { actor, isFetching } = useActor();

  return useQuery<Prediction | null>({
    queryKey: ['prediction', id],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getPrediction(id);
    },
    enabled: !!actor && !isFetching && !!id,
  });
}
