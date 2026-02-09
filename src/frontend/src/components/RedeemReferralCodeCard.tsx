import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Ticket } from 'lucide-react';
import { useRedeemReferralCode } from '../hooks/useReferralCodes';

export default function RedeemReferralCodeCard() {
  const [code, setCode] = useState('');
  const redeemCode = useRedeemReferralCode();

  const handleRedeem = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!code.trim()) {
      toast.error('Please enter a referral code');
      return;
    }

    try {
      await redeemCode.mutateAsync(code);
      toast.success('Referral code redeemed successfully! You now have premium access.');
      setCode('');
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to redeem code';
      
      // Map backend errors to user-friendly messages
      if (errorMessage.includes('Invalid referral code')) {
        toast.error('Invalid referral code. Please check and try again.');
      } else if (errorMessage.includes('expired')) {
        toast.error('This referral code has expired.');
      } else if (errorMessage.includes('revoked')) {
        toast.error('This referral code is no longer valid.');
      } else if (errorMessage.includes('already')) {
        toast.error('You have already used this referral code.');
      } else {
        toast.error(errorMessage);
      }
    }
  };

  return (
    <Card className="border-cash-gold/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Ticket className="h-5 w-5 text-cash-gold" />
          Redeem Referral Code
        </CardTitle>
        <CardDescription>Enter a referral code to get premium access</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleRedeem} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="referral-code">Referral Code</Label>
            <Input
              id="referral-code"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="WELCOME2025"
              className="font-mono"
            />
          </div>
          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-cash-green to-cash-gold hover:opacity-90 text-black font-semibold"
            disabled={redeemCode.isPending}
          >
            {redeemCode.isPending ? 'Redeeming...' : 'Redeem Code'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
