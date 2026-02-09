import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import HeroBranding from '../components/HeroBranding';
import ResponsibleGamblingDisclaimer from '../components/ResponsibleGamblingDisclaimer';
import { TrendingUp, Shield, Zap, Target, DollarSign, Calendar } from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col">
      <HeroBranding />

      <section className="container py-16">
        <div className="max-w-5xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold">Why Choose CashPicks?</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our AI analyzes multiple factors to give you transparent, data-driven predictions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="border-cash-gold/20 hover:border-cash-gold/40 transition-colors">
              <CardHeader>
                <Target className="h-10 w-10 text-cash-gold mb-2" />
                <CardTitle>Depth Chart Analysis</CardTitle>
                <CardDescription>Track player positions and lineup changes that impact game outcomes</CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-cash-gold/20 hover:border-cash-gold/40 transition-colors">
              <CardHeader>
                <Shield className="h-10 w-10 text-cash-gold mb-2" />
                <CardTitle>Injury Reports</CardTitle>
                <CardDescription>Real-time injury status updates for key players across all leagues</CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-cash-gold/20 hover:border-cash-gold/40 transition-colors">
              <CardHeader>
                <TrendingUp className="h-10 w-10 text-cash-gold mb-2" />
                <CardTitle>Coaching Styles</CardTitle>
                <CardDescription>Understand how coaching strategies affect team performance</CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-cash-gold/20 hover:border-cash-gold/40 transition-colors">
              <CardHeader>
                <Zap className="h-10 w-10 text-cash-gold mb-2" />
                <CardTitle>Player News & Drama</CardTitle>
                <CardDescription>Stay informed about off-field factors that influence games</CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-cash-gold/20 hover:border-cash-gold/40 transition-colors">
              <CardHeader>
                <DollarSign className="h-10 w-10 text-cash-gold mb-2" />
                <CardTitle>Dabble Format</CardTitle>
                <CardDescription>Predictions formatted for easy manual entry on Dabble platform</CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-cash-gold/20 hover:border-cash-gold/40 transition-colors">
              <CardHeader>
                <Calendar className="h-10 w-10 text-cash-gold mb-2" />
                <CardTitle>Daily Updates</CardTitle>
                <CardDescription>Fresh predictions every day based on the latest data</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      <section className="container py-16">
        <div className="max-w-4xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold">Simple, Transparent Pricing</h2>
            <p className="text-lg text-muted-foreground">Choose the plan that works for you</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="border-cash-gold/30 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-cash-gold/5 rounded-full blur-2xl"></div>
              <CardHeader className="relative">
                <CardTitle className="text-2xl">Monthly</CardTitle>
                <CardDescription>Perfect for trying out our service</CardDescription>
              </CardHeader>
              <CardContent className="relative space-y-6">
                <div className="space-y-2">
                  <div className="text-5xl font-bold text-cash-gold">$25</div>
                  <div className="text-muted-foreground">per month</div>
                </div>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-cash-gold"></div>
                    Unlimited predictions
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-cash-gold"></div>
                    All sports covered
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-cash-gold"></div>
                    Dabble format export
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-cash-gold"></div>
                    Daily updates
                  </li>
                </ul>
                <Button
                  onClick={() => navigate({ to: '/pricing' })}
                  className="w-full bg-gradient-to-r from-cash-green to-cash-gold hover:opacity-90 text-black font-semibold"
                >
                  Get Started
                </Button>
              </CardContent>
            </Card>

            <Card className="border-cash-gold/50 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-gradient-to-br from-cash-green to-cash-gold text-black text-xs font-bold px-3 py-1 rounded-bl-lg">
                BEST VALUE
              </div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-cash-gold/10 rounded-full blur-2xl"></div>
              <CardHeader className="relative">
                <CardTitle className="text-2xl">Yearly</CardTitle>
                <CardDescription>Save over 15% with annual billing</CardDescription>
              </CardHeader>
              <CardContent className="relative space-y-6">
                <div className="space-y-2">
                  <div className="text-5xl font-bold text-cash-gold">$250</div>
                  <div className="text-muted-foreground">per year</div>
                  <div className="text-sm text-cash-green">Save $50 compared to monthly</div>
                </div>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-cash-gold"></div>
                    Unlimited predictions
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-cash-gold"></div>
                    All sports covered
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-cash-gold"></div>
                    Dabble format export
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-cash-gold"></div>
                    Daily updates
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-cash-gold"></div>
                    Priority support
                  </li>
                </ul>
                <Button
                  onClick={() => navigate({ to: '/pricing' })}
                  className="w-full bg-gradient-to-r from-cash-green to-cash-gold hover:opacity-90 text-black font-semibold"
                >
                  Get Started
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="container py-16">
        <ResponsibleGamblingDisclaimer />
      </section>
    </div>
  );
}
