import { useState } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import PremiumGate from '../components/PremiumGate';
import TermsAcceptanceGate from '../components/TermsAcceptanceGate';
import PredictionsFilters from '../components/PredictionsFilters';
import ResponsibleGamblingDisclaimer from '../components/ResponsibleGamblingDisclaimer';
import LiveScoreInline from '../components/LiveScoreInline';
import { useGetAllPredictions, useGetPredictionsBySport } from '../hooks/useQueries';
import { useGetAllLiveScores } from '../hooks/useLiveScores';
import { TrendingUp, Calendar, Target, Shield } from 'lucide-react';
import { getRiskTier } from '../utils/riskTier';
import { PREDICTIONS_REFETCH_INTERVAL_MS } from '../utils/refetchIntervals';
import type { Prediction, LiveScore } from '../backend';

function sportsCategoryToText(category: Prediction['sport']): string {
  if ('nba' in category) return 'NBA';
  if ('nfl' in category) return 'NFL';
  if ('mlb' in category) return 'MLB';
  if ('nhl' in category) return 'NHL';
  if ('ncaaf' in category) return 'NCAAF';
  if ('ncaabb' in category) return 'NCAABB';
  if ('soccer' in category) return 'Soccer';
  if ('other' in category) return category.other;
  return 'Unknown';
}

function bettingMarketToText(market: Prediction['market']): string {
  if ('pointSpreads' in market) return 'Point Spread';
  if ('moneyLine' in market) return 'Money Line';
  if ('overUnder' in market) return 'Over/Under';
  if ('alternativeSpreads' in market) return 'Alternative Spread';
  if ('alternativeOvers' in market) return 'Alternative Over';
  if ('sameGameParlays' in market) return 'Same Game Parlay';
  if ('otherMarkets' in market) return market.otherMarkets;
  return 'Unknown';
}

function findLiveScoreForPrediction(prediction: Prediction, liveScores: LiveScore[]): LiveScore | null {
  const sportText = sportsCategoryToText(prediction.sport).toLowerCase();
  
  for (const score of liveScores) {
    const homeTeamLower = score.homeTeam.toLowerCase();
    const awayTeamLower = score.awayTeam.toLowerCase();
    const marketValue = prediction.marketValue.toLowerCase();
    
    if (marketValue.includes(homeTeamLower) || marketValue.includes(awayTeamLower) ||
        homeTeamLower.includes(marketValue.split(' ')[0]) || awayTeamLower.includes(marketValue.split(' ')[0])) {
      return score;
    }
  }
  
  return null;
}

function PredictionsContent() {
  const [sport, setSport] = useState('all');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const navigate = useNavigate();

  const allPredictionsQuery = useGetAllPredictions({
    refetchInterval: PREDICTIONS_REFETCH_INTERVAL_MS,
    refetchIntervalInBackground: false,
  });
  const sportPredictionsQuery = useGetPredictionsBySport(sport, {
    refetchInterval: PREDICTIONS_REFETCH_INTERVAL_MS,
    refetchIntervalInBackground: false,
  });

  const query = sport === 'all' ? allPredictionsQuery : sportPredictionsQuery;
  const { data: predictions = [], isLoading, error } = query;

  const { data: liveScores = [], isLoading: liveScoresLoading } = useGetAllLiveScores(true);

  const sortedPredictions = [...predictions].sort((a, b) => {
    const dateA = Number(a.matchDate);
    const dateB = Number(b.matchDate);
    return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cash-gold"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive">Failed to load predictions. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="container py-12">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold">Premium Predictions</h1>
          <p className="text-lg text-muted-foreground">
            AI-powered sports betting predictions based on comprehensive analysis
          </p>
        </div>

        <ResponsibleGamblingDisclaimer />

        <PredictionsFilters
          sport={sport}
          onSportChange={setSport}
          sortOrder={sortOrder}
          onSortOrderChange={setSortOrder}
        />

        {sortedPredictions.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No predictions available yet. Check back soon!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {sortedPredictions.map((prediction) => {
              const confidence = (prediction.winningProbability * 100).toFixed(1);
              const matchDate = new Date(Number(prediction.matchDate) / 1000000);
              const riskTier = getRiskTier(prediction);
              const liveScore = findLiveScoreForPrediction(prediction, liveScores);

              return (
                <Card
                  key={prediction.id}
                  className="border-cash-gold/20 hover:border-cash-gold/40 transition-all hover:shadow-lg cursor-pointer h-full"
                  onClick={() => navigate({ to: '/predictions/$id', params: { id: prediction.id } })}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1 flex-1">
                        <CardTitle className="text-xl">{sportsCategoryToText(prediction.sport)}</CardTitle>
                        <CardDescription>{bettingMarketToText(prediction.market)}</CardDescription>
                      </div>
                      <Badge
                        variant="outline"
                        className="border-cash-gold/30 text-cash-gold bg-cash-gold/5 whitespace-nowrap"
                      >
                        {confidence}% confidence
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Target className="h-4 w-4 text-cash-gold" />
                        <span className="font-semibold">{prediction.marketValue}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <TrendingUp className="h-4 w-4" />
                        <span>Odds: {prediction.juice}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>{matchDate.toLocaleDateString()}</span>
                      </div>
                    </div>
                    <Badge variant="outline" className={`${riskTier.bgColor} ${riskTier.color} border flex items-center gap-1.5 w-fit`}>
                      <Shield className="h-3 w-3" />
                      {riskTier.label}
                    </Badge>
                    {!liveScoresLoading && (
                      <div className="pt-2 border-t border-border/40">
                        <LiveScoreInline liveScore={liveScore} />
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default function PredictionsPage() {
  return (
    <PremiumGate>
      <TermsAcceptanceGate>
        <PredictionsContent />
      </TermsAcceptanceGate>
    </PremiumGate>
  );
}
