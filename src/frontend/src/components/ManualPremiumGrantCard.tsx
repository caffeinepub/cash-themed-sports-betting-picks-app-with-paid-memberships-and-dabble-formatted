import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useManualPremiumGrant } from '../hooks/useManualPremiumGrant';
import { useManualPremiumRevoke } from '../hooks/useManualPremiumRevoke';
import { toast } from 'sonner';
import { Crown, UserPlus, UserMinus } from 'lucide-react';

export default function ManualPremiumGrantCard() {
  const [userPrincipal, setUserPrincipal] = useState('');
  const grantPremium = useManualPremiumGrant();
  const revokePremium = useManualPremiumRevoke();

  const handleGrant = async (e: React.FormEvent) => {
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
      } else if (error?.message?.includes('Invalid principal')) {
        toast.error('Invalid Principal ID format');
      } else {
        toast.error(error?.message || 'Failed to grant premium access');
      }
    }
  };

  const handleRevoke = async () => {
    if (!userPrincipal.trim()) {
      toast.error('Please enter a valid Principal ID');
      return;
    }

    try {
      await revokePremium.mutateAsync(userPrincipal.trim());
      toast.success('Premium access revoked successfully');
      setUserPrincipal('');
    } catch (error: any) {
      console.error('Revoke error:', error);
      if (error?.message?.includes('Unauthorized')) {
        toast.error('Unauthorized: Only admins can revoke premium access');
      } else if (error?.message?.includes('No user found')) {
        toast.error('No user found with manual premium access');
      } else if (error?.message?.includes('Invalid principal')) {
        toast.error('Invalid Principal ID format');
      } else {
        toast.error(error?.message || 'Failed to revoke premium access');
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
        <CardDescription>Grant or revoke permanent premium access for a user without requiring payment</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleGrant} className="space-y-4">
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
              Enter the Principal ID of the user you want to grant or revoke premium access
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              type="submit"
              className="flex-1 bg-gradient-to-r from-cash-green to-cash-gold hover:opacity-90 text-black font-semibold"
              disabled={grantPremium.isPending || revokePremium.isPending}
            >
              {grantPremium.isPending ? (
                'Granting Access...'
              ) : (
                <>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Grant Access
                </>
              )}
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  type="button"
                  variant="destructive"
                  className="flex-1"
                  disabled={grantPremium.isPending || revokePremium.isPending}
                >
                  {revokePremium.isPending ? (
                    'Revoking Access...'
                  ) : (
                    <>
                      <UserMinus className="h-4 w-4 mr-2" />
                      Revoke Access
                    </>
                  )}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Revoke Premium Access</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to revoke manual premium access for this user? This action will remove their permanent access, but will not affect any active Stripe subscriptions or referral codes they may have.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleRevoke} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    Revoke Access
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
