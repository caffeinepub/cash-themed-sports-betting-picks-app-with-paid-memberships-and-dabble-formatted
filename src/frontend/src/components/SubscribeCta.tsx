import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Lock, Sparkles } from 'lucide-react';

export default function SubscribeCta() {
  const navigate = useNavigate();

  return (
    <div className="container py-12">
      <div className="max-w-3xl mx-auto">
        <div className="relative overflow-hidden rounded-2xl border border-cash-gold/20 bg-gradient-to-br from-card to-card/50 p-8 md:p-12">
          <div className="absolute top-0 right-0 w-64 h-64 bg-cash-gold/5 rounded-full blur-3xl"></div>
          <div className="relative space-y-6 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-cash-green to-cash-gold mb-4">
              <Lock className="h-10 w-10 text-black" />
            </div>
            <h2 className="text-4xl font-bold">Unlock Premium Predictions</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Get access to AI-powered sports betting predictions that analyze depth charts, injury reports, coaching
              styles, and player news to give you the edge.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button
                size="lg"
                onClick={() => navigate({ to: '/pricing' })}
                className="bg-gradient-to-r from-cash-green to-cash-gold hover:opacity-90 text-black font-semibold"
              >
                <Sparkles className="h-5 w-5 mr-2" />
                View Pricing Plans
              </Button>
            </div>
            <div className="pt-6 grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
              <div className="space-y-2">
                <div className="text-cash-gold font-semibold">Comprehensive Analysis</div>
                <div className="text-muted-foreground">Depth charts, injuries, coaching styles</div>
              </div>
              <div className="space-y-2">
                <div className="text-cash-gold font-semibold">Dabble Format</div>
                <div className="text-muted-foreground">Ready-to-use bet formatting</div>
              </div>
              <div className="space-y-2">
                <div className="text-cash-gold font-semibold">Daily Updates</div>
                <div className="text-muted-foreground">Fresh predictions every day</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
