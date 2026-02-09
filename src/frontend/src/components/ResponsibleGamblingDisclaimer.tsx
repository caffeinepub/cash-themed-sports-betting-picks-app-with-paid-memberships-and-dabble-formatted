import { AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function ResponsibleGamblingDisclaimer() {
  return (
    <Alert variant="default" className="border-cash-gold/30 bg-card/50">
      <AlertTriangle className="h-4 w-4 text-cash-gold" />
      <AlertTitle className="text-cash-gold">Important Disclaimer</AlertTitle>
      <AlertDescription className="text-sm text-muted-foreground space-y-2">
        <p>
          These predictions are for informational purposes only and do not guarantee winning outcomes. Our AI learns
          and improves with usage over time, but predictions may not always be accurate and can contain errors.
        </p>
        <p>
          Sports betting involves risk. Please gamble responsibly and never bet more than you can afford to lose. If
          you or someone you know has a gambling problem, call 1-800-GAMBLER.
        </p>
      </AlertDescription>
    </Alert>
  );
}
