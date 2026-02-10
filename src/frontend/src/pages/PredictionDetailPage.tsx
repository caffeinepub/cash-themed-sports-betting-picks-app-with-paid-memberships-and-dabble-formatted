import { useParams, useNavigate } from '@tanstack/react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import PremiumGate from '../components/PremiumGate';
import TermsAcceptanceGate from '../components/TermsAcceptanceGate';
import DabbleFormatCard from '../components/DabbleFormatCard';
import ResponsibleGamblingDisclaimer from '../components/ResponsibleGamblingDisclaimer';
import LiveScorePanel from '../components/LiveScorePanel';
import { useGetPrediction } from '../hooks/useQueries';
import { useGetAllLiveScores } from '../hooks/useLiveScores';
import { ArrowLeft, Calendar, Target, TrendingUp, Percent, Shield } from 'lucide-react';
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

function PredictionDetailContent() {
  const { id } = useParams({ from: '/predictions/$id' });
  const navigate = useNavigate();
  const { data: prediction, isLoading, error } = useGetPrediction(id, {
    refetchInterval: PREDICTIONS_REFETCH_INTERVAL_MS,
    refetchIntervalInBackground: false,
  });

  const { data: liveScores = [], isLoading: liveScoresLoading } = useGetAllLiveScores(true);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cash-gold"></div>
      </div>
    );
  }

  if (error || !prediction) {
    return (
      <div className="container py-12">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <p className="text-destructive">Failed to load prediction. Please try again.</p>
          <Button onClick={() => navigate({ to: '/predictions' })} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Predictions
          </Button>
        </div>
      </div>
    );
  }

  const confidence = (prediction.winningProbability * 100).toFixed(1);
  const matchDate = new Date(Number(prediction.matchDate) / 1000000);
  const createdDate = new Date(Number(prediction.createdAt) / 1000000);
  const riskTier = getRiskTier(prediction);
  const liveScore = findLiveScoreForPrediction(prediction, liveScores);

  return (
    <div className="container py-12">
      <div className="max-w-4xl mx-auto space-y-8">
        <Button onClick={() => navigate({ to: '/predictions' })} variant="ghost" className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Predictions
        </Button>

        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-4xl font-bold">{sportsCategoryToText(prediction.sport)}</h1>
            <Badge variant="outline" className="border-cash-gold/30 text-cash-gold bg-cash-gold/5">
              {confidence}% confidence
            </Badge>
            <Badge variant="outline" className={`${riskTier.bgColor} ${riskTier.color} border flex items-center gap-1.5`}>
              <Shield className="h-3 w-3" />
              {riskTier.label}
            </Badge>
          </div>
          <p className="text-lg text-muted-foreground">{bettingMarketToText(prediction.market)}</p>
        </div>

        <ResponsibleGamblingDisclaimer />

        <LiveScorePanel liveScore={liveScore} isLoading={liveScoresLoading} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-cash-gold/20">
            <CardHeader>
              <CardTitle className="text-cash-gold">Prediction Details</CardTitle>
              <CardDescription>Key information about this prediction</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start justify-between py-2 border-b border-border/40">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-cash-gold" />
                    <span className="text-sm text-muted-foreground">Selection</span>
                  </div>
                  <span className="font-semibold text-right">{prediction.marketValue}</span>
                </div>
                <div className="flex items-start justify-between py-2 border-b border-border/40">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-cash-gold" />
                    <span className="text-sm text-muted-foreground">Odds/Price</span>
                  </div>
                  <span className="font-semibold text-right">{prediction.juice}</span>
                </div>
                <div className="flex items-start justify-between py-2 border-b border-border/40">
                  <div className="flex items-center gap-2">
                    <Percent className="h-4 w-4 text-cash-gold" />
                    <span className="text-sm text-muted-foreground">Win Probability</span>
                  </div>
                  <span className="font-semibold text-right">{confidence}%</span>
                </div>
                <div className="flex items-start justify-between py-2 border-b border-border/40">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-cash-gold" />
                    <span className="text-sm text-muted-foreground">Match Date</span>
                  </div>
                  <span className="font-semibold text-right">{matchDate.toLocaleDateString()}</span>
                </div>
                <div className="flex items-start justify-between py-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-cash-gold" />
                    <span className="text-sm text-muted-foreground">Created</span>
                  </div>
                  <span className="font-semibold text-right">{createdDate.toLocaleDateString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-cash-gold/20">
            <CardHeader>
              <CardTitle className="text-cash-gold flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Risk Assessment
              </CardTitle>
              <CardDescription>Understanding the risk level</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted/50 p-4 rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Risk Tier</span>
                  <Badge variant="outline" className={`${riskTier.bgColor} ${riskTier.color} border`}>
                    Tier {riskTier.tier}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{riskTier.description}</p>
              </div>
              <div className="text-xs text-muted-foreground space-y-2">
                <p>
                  <strong>Risk Tiers Explained:</strong>
                </p>
                <ul className="space-y-1 ml-4 list-disc">
                  <li>Tier 1: Highest confidence, lowest risk, lower reward potential</li>
                  <li>Tier 2-3: Balanced confidence and risk/reward</li>
                  <li>Tier 4-5: Lower confidence, higher risk, higher reward potential</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        <DabbleFormatCard prediction={prediction} />

        <Card className="border-cash-gold/20 bg-card/50">
          <CardHeader>
            <CardTitle className="text-cash-gold">Analysis Factors</CardTitle>
            <CardDescription>This prediction is based on comprehensive data analysis</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-cash-gold"></div>
                <span>Team depth charts</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-cash-gold"></div>
                <span>Injury reports</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-cash-gold"></div>
                <span>Coaching styles</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-cash-gold"></div>
                <span>Player news & drama</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function PredictionDetailPage() {
  return (
    <PremiumGate>
      <TermsAcceptanceGate>
        <PredictionDetailContent />
      </TermsAcceptanceGate>
    </PremiumGate>
  );
}
