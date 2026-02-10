import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useAdminPremiumDiagnosis } from '../hooks/useAdminPremiumDiagnosis';
import { Search, Info, CheckCircle2, XCircle, Calendar, Shield } from 'lucide-react';
import type { PremiumSource } from '../backend';

export default function AdminSupportCard() {
  const [principalInput, setPrincipalInput] = useState('');
  const [targetPrincipal, setTargetPrincipal] = useState<string | null>(null);

  const { data: diagnosis, isLoading, error, isFetched } = useAdminPremiumDiagnosis(targetPrincipal);

  const handleLookup = (e: React.FormEvent) => {
    e.preventDefault();
    if (principalInput.trim()) {
      setTargetPrincipal(principalInput.trim());
    }
  };

  const getPremiumSourceLabel = (source: PremiumSource): string => {
    switch (source) {
      case 'creator':
        return 'Creator Access';
      case 'admin':
        return 'Admin Access';
      case 'manual':
        return 'Manual Grant';
      case 'stripe':
        return 'Stripe Subscription';
      case 'referral':
        return 'Referral Code';
      case 'none':
        return 'No Access';
      default:
        return 'Unknown';
    }
  };

  const getPremiumSourceDescription = (source: PremiumSource): string => {
    switch (source) {
      case 'creator':
        return 'This user is the creator and has permanent premium access.';
      case 'admin':
        return 'This user is an admin and has permanent premium access.';
      case 'manual':
        return 'This user has been granted permanent premium access by an administrator.';
      case 'stripe':
        return 'This user has active premium access through a Stripe subscription.';
      case 'referral':
        return 'This user has active premium access through a referral code.';
      case 'none':
        return 'This user does not have active premium access.';
      default:
        return 'Unknown premium source.';
    }
  };

  const formatDate = (timestamp: bigint): string => {
    const date = new Date(Number(timestamp) / 1000000);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  return (
    <Card className="border-cash-gold/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-cash-gold" />
          Admin Support
        </CardTitle>
        <CardDescription>Diagnose a user's premium status by Principal ID</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleLookup} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="principal-lookup">User Principal ID</Label>
            <Input
              id="principal-lookup"
              value={principalInput}
              onChange={(e) => setPrincipalInput(e.target.value)}
              placeholder="xxxxx-xxxxx-xxxxx-xxxxx-xxxxx-xxxxx-xxxxx-xxxxx-xxx"
              required
            />
            <p className="text-xs text-muted-foreground">
              Enter the Principal ID of the user you want to diagnose
            </p>
          </div>
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? (
              'Looking up...'
            ) : (
              <>
                <Search className="h-4 w-4 mr-2" />
                Lookup User Status
              </>
            )}
          </Button>
        </form>

        {error && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>
              {error instanceof Error ? error.message : 'Failed to lookup user status'}
            </AlertDescription>
          </Alert>
        )}

        {isFetched && diagnosis && (
          <div className="space-y-4 pt-4 border-t">
            <h3 className="font-semibold text-lg">Diagnostic Report</h3>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Premium Status</span>
                <Badge
                  variant={diagnosis.premiumSource !== 'none' ? 'default' : 'secondary'}
                  className="font-semibold"
                >
                  {diagnosis.premiumSource !== 'none' ? (
                    <>
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Active
                    </>
                  ) : (
                    <>
                      <XCircle className="h-3 w-3 mr-1" />
                      Inactive
                    </>
                  )}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Premium Source</span>
                <span className="font-semibold text-sm">{getPremiumSourceLabel(diagnosis.premiumSource)}</span>
              </div>

              <Alert className="bg-muted border-muted-foreground/20">
                <Info className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  {getPremiumSourceDescription(diagnosis.premiumSource)}
                </AlertDescription>
              </Alert>

              {diagnosis.user ? (
                <>
                  <div className="space-y-2 pt-2">
                    <h4 className="font-semibold text-sm">User Profile Details</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Name:</span>
                        <span className="font-medium">{diagnosis.user.name || 'Not set'}</span>
                      </div>
                      {diagnosis.user.email && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Email:</span>
                          <span className="font-medium">{diagnosis.user.email}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Manual Premium:</span>
                        <span className="font-medium">{diagnosis.user.hasManualPremium ? 'Yes' : 'No'}</span>
                      </div>
                    </div>
                  </div>

                  {diagnosis.user.subscription && (
                    <div className="space-y-2 pt-2 border-t">
                      <h4 className="font-semibold text-sm flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Stripe Subscription
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Plan:</span>
                          <span className="font-medium capitalize">{diagnosis.user.subscription.plan}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Expires:</span>
                          <span className="font-medium">{formatDate(diagnosis.user.subscription.expiresAt)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Session ID:</span>
                          <span className="font-mono text-xs break-all">{diagnosis.user.subscription.stripeSessionId}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {diagnosis.user.referral && (
                    <div className="space-y-2 pt-2 border-t">
                      <h4 className="font-semibold text-sm flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Referral Code
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Code:</span>
                          <span className="font-mono">{diagnosis.user.referral.code}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Expires:</span>
                          <span className="font-medium">{formatDate(diagnosis.user.referral.expiresAt)}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <Alert className="bg-muted border-muted-foreground/20">
                  <Info className="h-4 w-4" />
                  <AlertDescription className="text-sm">
                    No user profile found. This user has not logged in or created a profile yet.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
