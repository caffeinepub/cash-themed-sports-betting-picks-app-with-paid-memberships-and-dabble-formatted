import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, Check } from 'lucide-react';
import { toast } from 'sonner';
import { getRiskTier } from '../utils/riskTier';
import type { Prediction } from '../backend';

interface DabbleFormatCardProps {
  prediction: Prediction;
}

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

export default function DabbleFormatCard({ prediction }: DabbleFormatCardProps) {
  const [copied, setCopied] = useState(false);

  const sport = sportsCategoryToText(prediction.sport);
  const market = bettingMarketToText(prediction.market);
  const confidence = (prediction.winningProbability * 100).toFixed(1);
  const riskTier = getRiskTier(prediction);

  const dabbleText = `
Sport: ${sport}
Market: ${market}
Selection: ${prediction.marketValue}
Odds/Price: ${prediction.juice}
Confidence: ${confidence}%
Risk Tier: ${riskTier.label}
Units: 1
Notes: AI-generated prediction based on depth charts, injuries, coaching styles, and player news. For manual entry on Dabble platform.
`.trim();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(dabbleText);
      setCopied(true);
      toast.success('Copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy to clipboard');
    }
  };

  return (
    <Card className="border-cash-gold/20">
      <CardHeader>
        <CardTitle className="text-cash-gold">Dabble Format</CardTitle>
        <CardDescription>Copy this formatted text for manual entry on Dabble</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <pre className="bg-muted/50 p-4 rounded-lg text-sm whitespace-pre-wrap font-mono">{dabbleText}</pre>
        <Button
          onClick={handleCopy}
          variant="outline"
          className="w-full border-cash-gold/30 hover:bg-cash-gold/10"
        >
          {copied ? (
            <>
              <Check className="h-4 w-4 mr-2" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="h-4 w-4 mr-2" />
              Copy to Clipboard
            </>
          )}
        </Button>
        <p className="text-xs text-muted-foreground text-center">
          Note: This format is for manual entry only. CashPicks does not automatically place bets on Dabble.
        </p>
      </CardContent>
    </Card>
  );
}
