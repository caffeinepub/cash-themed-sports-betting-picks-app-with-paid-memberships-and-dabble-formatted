import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile } from '../hooks/useUserProfile';
import { useSubscription } from '../hooks/useSubscription';
import { useRestorePremiumAccess } from '../hooks/useRestorePremiumAccess';
import { useIsAdmin } from '../hooks/useAdmin';
import { User, Mail, CreditCard, Calendar, Shield, RefreshCw, Copy, Info } from 'lucide-react';
import { toast } from 'sonner';
import LoginButton from '../components/LoginButton';
import AccountProfileEditor from '../components/AccountProfileEditor';
import RedeemReferralCodeCard from '../components/RedeemReferralCodeCard';

export default function AccountPage() {
  const { identity } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading } = useGetCallerUserProfile();
  const { subscriptionStatus, referralStatus, hasActiveAccess, premiumSource, isLoading: subLoading } =
    useSubscription();
  const { data: isAdmin, isLoading: adminLoading } = useIsAdmin();
  const restorePremiumAccess = useRestorePremiumAccess();

  const isAuthenticated = !!identity;

  const handleRestoreAccess = async () => {
    try {
      await restorePremiumAccess.mutateAsync();
      toast.success('Premium access status refreshed');
    } catch (error) {
      console.error('Restore error:', error);
      toast.error('Failed to refresh premium access');
    }
  };

  const handleCopyPrincipalId = async () => {
    if (!identity) return;
    const principalId = identity.getPrincipal().toString();
    try {
      await navigator.clipboard.writeText(principalId);
      toast.success('Principal ID copied to clipboard');
    } catch (error) {
      console.error('Copy error:', error);
      toast.error('Failed to copy Principal ID');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="container py-12">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <h1 className="text-4xl font-bold">Account</h1>
          <p className="text-muted-foreground">Please sign in to view your account details</p>
          <LoginButton />
        </div>
      </div>
    );
  }

  if (profileLoading || subLoading || adminLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cash-gold"></div>
      </div>
    );
  }

  const subscriptionExpiresAt = subscriptionStatus ? new Date(Number(subscriptionStatus.expiresAt) / 1000000) : null;
  const referralExpiresAt = referralStatus ? new Date(Number(referralStatus.expiresAt) / 1000000) : null;
  const planName =
    subscriptionStatus?.plan === 'monthly' ? 'Monthly' : subscriptionStatus?.plan === 'yearly' ? 'Yearly' : 'None';

  const getPremiumSourceLabel = () => {
    if (premiumSource === 'creator') return 'Creator Access';
    if (premiumSource === 'admin') return 'Admin Access';
    if (premiumSource === 'manual') return 'Manual Grant';
    if (premiumSource === 'stripe') return 'Stripe Subscription';
    if (premiumSource === 'referral') return 'Referral Code';
    return 'None';
  };

  const getPremiumSourceDescription = () => {
    if (premiumSource === 'creator') return 'You are the creator and have permanent access to all premium features.';
    if (premiumSource === 'admin') return 'You have permanent admin access to all premium features.';
    if (premiumSource === 'manual') return 'You have been granted permanent premium access by an administrator.';
    if (premiumSource === 'stripe') return 'Your premium access is active through your Stripe subscription.';
    if (premiumSource === 'referral') return 'Your premium access is active through a referral code.';
    return null;
  };

  return (
    <div className="container py-12">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold">Account</h1>
          <p className="text-lg text-muted-foreground">Manage your profile and subscription</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-cash-gold/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-cash-gold" />
                Profile Information
              </CardTitle>
              <CardDescription>Your account details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-sm text-muted-foreground">Name</div>
                <div className="font-semibold">{userProfile?.name || 'Not set'}</div>
              </div>
              {userProfile?.email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-sm text-muted-foreground">Email</div>
                    <div className="font-semibold">{userProfile.email}</div>
                  </div>
                </div>
              )}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  <div className="text-sm text-muted-foreground">Principal ID</div>
                </div>
                <div className="font-mono text-xs break-all bg-muted p-2 rounded">
                  {identity?.getPrincipal().toString()}
                </div>
                <Button
                  onClick={handleCopyPrincipalId}
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Principal ID
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-cash-gold/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-cash-gold" />
                Premium Access
              </CardTitle>
              <CardDescription>Your subscription status</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Status</span>
                <Badge variant={hasActiveAccess ? 'default' : 'secondary'} className="font-semibold">
                  {hasActiveAccess ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              {premiumSource !== 'none' && (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Source</span>
                    <span className="font-semibold text-sm">{getPremiumSourceLabel()}</span>
                  </div>
                  {getPremiumSourceDescription() && (
                    <Alert className="bg-cash-gold/5 border-cash-gold/20">
                      <Info className="h-4 w-4 text-cash-gold" />
                      <AlertDescription className="text-sm">
                        {getPremiumSourceDescription()}
                      </AlertDescription>
                    </Alert>
                  )}
                </>
              )}
              {subscriptionStatus && (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Plan</span>
                    <span className="font-semibold">{planName}</span>
                  </div>
                  {subscriptionExpiresAt && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="text-sm text-muted-foreground">Expires</div>
                        <div className="font-semibold text-sm">{subscriptionExpiresAt.toLocaleDateString()}</div>
                      </div>
                    </div>
                  )}
                </>
              )}
              {referralStatus && (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Referral Code</span>
                    <span className="font-mono text-sm">{referralStatus.code}</span>
                  </div>
                  {referralExpiresAt && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="text-sm text-muted-foreground">Referral Expires</div>
                        <div className="font-semibold text-sm">{referralExpiresAt.toLocaleDateString()}</div>
                      </div>
                    </div>
                  )}
                </>
              )}
              
              {!hasActiveAccess && (
                <Alert className="bg-muted border-muted-foreground/20">
                  <Info className="h-4 w-4" />
                  <AlertDescription className="text-sm space-y-2">
                    <p className="font-semibold">No active premium access</p>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      <li>If you already paid, use "Restore Premium Access" below</li>
                      <li>To get permanent access, share your Principal ID with an admin for a manual grant</li>
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              <Button
                onClick={handleRestoreAccess}
                disabled={restorePremiumAccess.isPending}
                variant="outline"
                className="w-full"
              >
                {restorePremiumAccess.isPending ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Restoring...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Restore Premium Access
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        <AccountProfileEditor userProfile={userProfile} />

        <RedeemReferralCodeCard />
      </div>
    </div>
  );
}
