import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { AlertTriangle, FileText, Check } from 'lucide-react';
import { getTermsAcceptance, setTermsAcceptance } from '../utils/termsAcceptance';
import { toast } from 'sonner';

export default function TermsPage() {
  const navigate = useNavigate();
  const [accepted, setAccepted] = useState(false);
  const [isAlreadyAccepted, setIsAlreadyAccepted] = useState(false);

  useEffect(() => {
    const acceptance = getTermsAcceptance();
    if (acceptance.accepted) {
      setIsAlreadyAccepted(true);
    }
  }, []);

  const handleAccept = () => {
    if (!accepted) {
      toast.error('Please check the box to accept the Terms of Service');
      return;
    }

    setTermsAcceptance();
    toast.success('Terms of Service accepted');
    setIsAlreadyAccepted(true);
  };

  return (
    <div className="container py-12">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <FileText className="h-16 w-16 text-cash-gold" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold">Terms of Service</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Please read and accept our terms before using CashPicks predictions
          </p>
        </div>

        <Card className="border-cash-gold/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-cash-gold" />
              Important Legal Information
            </CardTitle>
            <CardDescription>Last updated: {new Date().toLocaleDateString()}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <ScrollArea className="h-[400px] w-full rounded-md border border-border/40 p-6">
              <div className="space-y-6 text-sm">
                <section className="space-y-3">
                  <h3 className="text-lg font-semibold text-cash-gold">1. Informational Use Only</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    All predictions, analyses, and recommendations provided by CashPicks are for informational and
                    entertainment purposes only. They do not constitute professional advice, guaranteed outcomes, or
                    winning strategies. Sports betting outcomes are inherently unpredictable, and past performance does
                    not guarantee future results.
                  </p>
                </section>

                <Separator />

                <section className="space-y-3">
                  <h3 className="text-lg font-semibold text-cash-gold">2. AI Learning and Accuracy</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    CashPicks uses artificial intelligence and machine learning algorithms that improve with usage over
                    time. However, predictions may not always be accurate, and the system can make errors regardless of
                    how much data it has processed. The AI learns from patterns in sports data, but sports outcomes
                    remain unpredictable and subject to countless variables beyond algorithmic analysis.
                  </p>
                  <p className="text-muted-foreground leading-relaxed">
                    By using this service, you acknowledge that AI-generated predictions are probabilistic estimates,
                    not certainties, and that accuracy may vary significantly across different sports, markets, and time
                    periods.
                  </p>
                </section>

                <Separator />

                <section className="space-y-3">
                  <h3 className="text-lg font-semibold text-cash-gold">3. No Guarantees</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    CashPicks makes no guarantees, warranties, or representations regarding the accuracy, reliability,
                    completeness, or timeliness of any predictions or information provided. We do not guarantee any
                    specific results, profits, or outcomes from using our service.
                  </p>
                </section>

                <Separator />

                <section className="space-y-3">
                  <h3 className="text-lg font-semibold text-cash-gold">4. Limitation of Liability</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    To the maximum extent permitted by law, CashPicks, its creators, operators, and affiliates shall not
                    be liable for any direct, indirect, incidental, consequential, special, or punitive damages arising
                    from or related to your use of this service, including but not limited to financial losses, lost
                    profits, or any other damages resulting from betting decisions made based on our predictions.
                  </p>
                  <p className="text-muted-foreground leading-relaxed">
                    You acknowledge and agree that you use CashPicks entirely at your own risk. All betting and wagering
                    decisions are your sole responsibility. By using this service, you waive any claims against
                    CashPicks for losses incurred.
                  </p>
                </section>

                <Separator />

                <section className="space-y-3">
                  <h3 className="text-lg font-semibold text-cash-gold">5. Responsible Gambling</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Sports betting involves financial risk and can be addictive. You should only bet what you can afford
                    to lose. If you or someone you know has a gambling problem, please seek help immediately by calling
                    1-800-GAMBLER or visiting a responsible gambling resource.
                  </p>
                </section>

                <Separator />

                <section className="space-y-3">
                  <h3 className="text-lg font-semibold text-cash-gold">6. Legal Compliance</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    You are responsible for ensuring that your use of CashPicks and any betting activities comply with
                    all applicable laws and regulations in your jurisdiction. CashPicks does not provide legal advice
                    regarding gambling laws.
                  </p>
                </section>

                <Separator />

                <section className="space-y-3">
                  <h3 className="text-lg font-semibold text-cash-gold">7. Acceptance of Terms</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    By checking the acceptance box below and using CashPicks, you acknowledge that you have read,
                    understood, and agree to be bound by these Terms of Service. You accept all risks associated with
                    using our predictions and agree to the limitations of liability stated herein.
                  </p>
                </section>
              </div>
            </ScrollArea>

            {isAlreadyAccepted ? (
              <div className="bg-cash-green/10 border border-cash-green/30 rounded-lg p-4 flex items-center gap-3">
                <Check className="h-5 w-5 text-cash-green flex-shrink-0" />
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-cash-green">Terms Already Accepted</p>
                  <p className="text-xs text-muted-foreground">
                    You have already accepted the Terms of Service. You can now access all features.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
                  <Checkbox id="accept-terms" checked={accepted} onCheckedChange={(checked) => setAccepted(!!checked)} />
                  <Label htmlFor="accept-terms" className="text-sm leading-relaxed cursor-pointer">
                    I have read and agree to the Terms of Service. I understand that predictions are not guaranteed, the
                    AI may be inaccurate, and I use this service at my own risk. I waive any claims for losses incurred.
                  </Label>
                </div>

                <Button
                  onClick={handleAccept}
                  disabled={!accepted}
                  className="w-full bg-gradient-to-r from-cash-green to-cash-gold hover:opacity-90 text-black font-semibold"
                >
                  Accept Terms and Continue
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="text-center">
          <Button variant="ghost" onClick={() => navigate({ to: '/' })}>
            Return to Home
          </Button>
        </div>
      </div>
    </div>
  );
}
