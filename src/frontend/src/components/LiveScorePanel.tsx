import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Radio, Clock } from 'lucide-react';
import type { LiveScore } from '../backend';

interface LiveScorePanelProps {
  liveScore?: LiveScore | null;
  isLoading?: boolean;
}

export default function LiveScorePanel({ liveScore, isLoading }: LiveScorePanelProps) {
  if (isLoading) {
    return (
      <Card className="border-cash-gold/20">
        <CardHeader>
          <CardTitle className="text-cash-gold flex items-center gap-2">
            <Clock className="h-5 w-5 animate-spin" />
            Loading Live Score...
          </CardTitle>
        </CardHeader>
      </Card>
    );
  }

  if (!liveScore) {
    return (
      <Card className="border-muted/40">
        <CardHeader>
          <CardTitle className="text-muted-foreground flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Live Score
          </CardTitle>
          <CardDescription>
            Live score information is not currently available for this game.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const isLive = liveScore.status === 'in_progress';
  const isFinal = liveScore.status === 'final';
  const lastUpdated = new Date(Number(liveScore.lastUpdated) / 1000000);

  return (
    <Card className={`border-2 ${isLive ? 'border-destructive/50 bg-destructive/5' : 'border-cash-gold/20'}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-cash-gold flex items-center gap-2">
            {isLive && <Radio className="h-5 w-5 animate-pulse text-destructive" />}
            {isLive ? 'LIVE SCORE' : 'Game Score'}
          </CardTitle>
          {isLive && (
            <Badge variant="destructive" className="animate-pulse">
              LIVE
            </Badge>
          )}
          {isFinal && (
            <Badge variant="secondary">
              FINAL
            </Badge>
          )}
        </div>
        {liveScore.currentPeriod && (
          <CardDescription className="font-semibold">
            {liveScore.currentPeriod}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">Away</div>
              <div className="font-semibold text-lg">{liveScore.awayTeam}</div>
            </div>
            <div className="text-3xl font-bold text-cash-gold">
              {Number(liveScore.awayScore)}
            </div>
          </div>
          <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">Home</div>
              <div className="font-semibold text-lg">{liveScore.homeTeam}</div>
            </div>
            <div className="text-3xl font-bold text-cash-gold">
              {Number(liveScore.homeScore)}
            </div>
          </div>
        </div>
        <div className="text-xs text-muted-foreground text-center pt-2 border-t border-border/40">
          Last updated: {lastUpdated.toLocaleTimeString()}
        </div>
      </CardContent>
    </Card>
  );
}
