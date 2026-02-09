import { useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

export default function PaymentSuccessPage() {
  const navigate = useNavigate();

  useEffect(() => {
    toast.success('Payment successful! Your subscription is now active.');
  }, []);

  return (
    <div className="container py-12">
      <div className="max-w-2xl mx-auto">
        <Card className="border-cash-gold/30">
          <CardHeader className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-cash-gold/10 mx-auto mb-4">
              <CheckCircle className="h-10 w-10 text-cash-gold" />
            </div>
            <CardTitle className="text-3xl">Payment Successful!</CardTitle>
            <CardDescription className="text-lg">Your subscription is now active</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 text-center">
            <p className="text-muted-foreground">
              Thank you for subscribing to CashPicks! You now have full access to all premium predictions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => navigate({ to: '/predictions' })}
                className="bg-gradient-to-r from-cash-green to-cash-gold hover:opacity-90 text-black font-semibold"
              >
                View Predictions
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
              <Button variant="outline" onClick={() => navigate({ to: '/account' })}>
                Go to Account
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
