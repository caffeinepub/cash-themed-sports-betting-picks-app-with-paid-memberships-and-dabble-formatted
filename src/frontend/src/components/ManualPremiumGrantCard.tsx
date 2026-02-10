import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useManualPremiumGrant } from '../hooks/useManualPremiumGrant';
import { toast } from 'sonner';
import { Crown, UserPlus } from 'lucide-react';

export default function ManualPremiumGrantCard() {
  const [userPrincipal, setUserPrincipal] = useState('');
  const grantPremium = useManualPremiumGrant();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userPrincipal.trim()) {
      toast.error('Please enter a valid Principal ID');
      return;
    }

    try {
      await grantPremium.mutateAsync(userPrincipal.trim());
      toast.success('Premium access granted successfully');
      setUserPrincipal('');
    } catch (error: any) {
      console.error('Grant error:', error);
      if (error?.message?.includes('Unauthorized')) {
        toast.error('Unauthorized: Only admins can grant premium access');
      } else {
        toast.error(error?.message || 'Failed to grant premium access');
      }
    }
  };

  return (
    <Card className="border-cash-gold/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Crown className="h-5 w-5 text-cash-gold" />
          Manual Premium Grant
        </CardTitle>
        <CardDescription>Grant permanent premium access to a user without requiring payment</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="user-principal">User Principal ID *</Label>
            <Input
              id="user-principal"
              value={userPrincipal}
              onChange={(e) => setUserPrincipal(e.target.value)}
              placeholder="xxxxx-xxxxx-xxxxx-xxxxx-xxxxx-xxxxx-xxxxx-xxxxx-xxx"
              required
            />
            <p className="text-xs text-muted-foreground">
              Enter the Principal ID of the user you want to grant premium access to
            </p>
          </div>
          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-cash-green to-cash-gold hover:opacity-90 text-black font-semibold"
            disabled={grantPremium.isPending}
          >
            {grantPremium.isPending ? (
              'Granting Access...'
            ) : (
              <>
                <UserPlus className="h-4 w-4 mr-2" />
                Grant Premium Access
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
