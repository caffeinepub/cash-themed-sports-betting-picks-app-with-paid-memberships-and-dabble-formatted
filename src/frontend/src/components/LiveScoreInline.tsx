import { Badge } from '@/components/ui/badge';
import { Radio } from 'lucide-react';
import type { LiveScore } from '../backend';

interface LiveScoreInlineProps {
  liveScore?: LiveScore | null;
  className?: string;
}

export default function LiveScoreInline({ liveScore, className = '' }: LiveScoreInlineProps) {
  if (!liveScore) {
    return (
      <div className={`text-xs text-muted-foreground ${className}`}>
        Score unavailable
      </div>
    );
  }

  const isLive = liveScore.status === 'in_progress';
  const isFinal = liveScore.status === 'final';

  return (
    <div className={`space-y-1 ${className}`}>
      <div className="flex items-center gap-2">
        {isLive && (
          <Badge variant="destructive" className="animate-pulse flex items-center gap-1 text-xs">
            <Radio className="h-3 w-3" />
            LIVE
          </Badge>
        )}
        {isFinal && (
          <Badge variant="secondary" className="text-xs">
            FINAL
          </Badge>
        )}
        {!isLive && !isFinal && (
          <Badge variant="outline" className="text-xs">
            {liveScore.status.toUpperCase()}
          </Badge>
        )}
      </div>
      <div className="text-sm space-y-0.5">
        <div className="flex items-center justify-between gap-2">
          <span className="text-muted-foreground">{liveScore.awayTeam}</span>
          <span className="font-semibold">{Number(liveScore.awayScore)}</span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="text-muted-foreground">{liveScore.homeTeam}</span>
          <span className="font-semibold">{Number(liveScore.homeScore)}</span>
        </div>
      </div>
      {liveScore.currentPeriod && (
        <div className="text-xs text-muted-foreground">
          {liveScore.currentPeriod}
        </div>
      )}
    </div>
  );
}
