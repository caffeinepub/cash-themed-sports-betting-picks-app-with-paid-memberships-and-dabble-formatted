import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { AlertTriangle, FileText } from 'lucide-react';
import { getTermsAcceptance, setTermsAcceptance } from '../utils/termsAcceptance';
import { toast } from 'sonner';

interface TermsAcceptanceGateProps {
  children: React.ReactNode;
}

export default function TermsAcceptanceGate({ children }: TermsAcceptanceGateProps) {
  const navigate = useNavigate();
  const [accepted, setAccepted] = useState(false);
  const [hasAcceptedTerms, setHasAcceptedTerms] = useState<boolean | null>(null);

  useEffect(() => {
    const acceptance = getTermsAcceptance();
    setHasAcceptedTerms(acceptance.accepted);
  }, []);

  const handleAccept = () => {
    if (!accepted) {
      toast.error('Please check the box to accept the Terms of Service');
      return;
    }

    setTermsAcceptance();
    setHasAcceptedTerms(true);
    toast.success('Terms of Service accepted');
  };

  const handleViewFullTerms = () => {
    navigate({ to: '/terms' });
  };

  // Loading state
  if (hasAcceptedTerms === null) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cash-gold"></div>
      </div>
    );
  }

  // Already accepted - show content
  if (hasAcceptedTerms) {
    return <>{children}</>;
  }

  // Not accepted - show gate
  return (
    <div className="container py-12">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <AlertTriangle className="h-16 w-16 text-cash-gold" />
          </div>
          <h1 className="text-4xl font-bold">Terms of Service Required</h1>
          <p className="text-lg text-muted-foreground">
            Please accept our Terms of Service to access this content
          </p>
        </div>

        <Card className="border-cash-gold/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-cash-gold" />
              Quick Summary
            </CardTitle>
            <CardDescription>You must accept these terms before continuing</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-muted/50 p-4 rounded-lg space-y-3 text-sm">
              <p className="text-muted-foreground">
                <strong className="text-foreground">Informational Only:</strong> Predictions are for informational
                purposes and do not guarantee winning outcomes.
              </p>
              <p className="text-muted-foreground">
                <strong className="text-foreground">AI Learning:</strong> Our AI improves with usage over time but may
                still be inaccurate. Predictions are probabilistic estimates, not certainties.
              </p>
              <p className="text-muted-foreground">
                <strong className="text-foreground">Limitation of Liability:</strong> You use CashPicks at your own
                risk. We are not liable for any losses incurred from betting decisions based on our predictions.
              </p>
              <p className="text-muted-foreground">
                <strong className="text-foreground">Responsible Gambling:</strong> Only bet what you can afford to
                lose. If you have a gambling problem, call 1-800-GAMBLER.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
                <Checkbox id="accept-terms-gate" checked={accepted} onCheckedChange={(checked) => setAccepted(!!checked)} />
                <Label htmlFor="accept-terms-gate" className="text-sm leading-relaxed cursor-pointer">
                  I have read and agree to the Terms of Service. I understand that predictions are not guaranteed, the
                  AI may be inaccurate, and I use this service at my own risk.
                </Label>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={handleAccept}
                  disabled={!accepted}
                  className="flex-1 bg-gradient-to-r from-cash-green to-cash-gold hover:opacity-90 text-black font-semibold"
                >
                  Accept and Continue
                </Button>
                <Button onClick={handleViewFullTerms} variant="outline" className="flex-1 border-cash-gold/30">
                  View Full Terms
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
