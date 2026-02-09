import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile } from '../hooks/useUserProfile';
import { useSubscription } from '../hooks/useSubscription';
import { User, Mail, CreditCard, Calendar, Shield } from 'lucide-react';
import LoginButton from '../components/LoginButton';
import AccountProfileEditor from '../components/AccountProfileEditor';
import RedeemReferralCodeCard from '../components/RedeemReferralCodeCard';

export default function AccountPage() {
  const { identity } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading } = useGetCallerUserProfile();
  const { subscriptionStatus, referralStatus, hasActiveAccess, isLoading: subLoading } = useSubscription();

  const isAuthenticated = !!identity;

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

  if (profileLoading || subLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cash-gold"></div>
      </div>
    );
  }

  const subscriptionExpiresAt = subscriptionStatus ? new Date(Number(subscriptionStatus.expiresAt) / 1000000) : null;
  const referralExpiresAt = referralStatus ? new Date(Number(referralStatus.expiresAt) / 1000000) : null;
  const planName = subscriptionStatus?.plan === 'monthly' ? 'Monthly' : subscriptionStatus?.plan === 'yearly' ? 'Yearly' : 'None';

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
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-sm text-muted-foreground">Principal ID</div>
                  <div className="font-mono text-xs break-all">{identity?.getPrincipal().toString()}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-cash-gold/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-cash-gold" />
                Premium Access Status
              </CardTitle>
              <CardDescription>Your current access</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-sm text-muted-foreground mb-2">Status</div>
                <Badge
                  variant={hasActiveAccess ? 'default' : 'outline'}
                  className={
                    hasActiveAccess
                      ? 'bg-gradient-to-r from-cash-green to-cash-gold text-black'
                      : 'border-muted-foreground/30'
                  }
                >
                  {hasActiveAccess ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              
              {subscriptionStatus && (
                <>
                  <div>
                    <div className="text-sm text-muted-foreground">Subscription Plan</div>
                    <div className="font-semibold">{planName}</div>
                  </div>
                  {subscriptionExpiresAt && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="text-sm text-muted-foreground">Subscription Expires</div>
                        <div className="font-semibold">{subscriptionExpiresAt.toLocaleDateString()}</div>
                      </div>
                    </div>
                  )}
                </>
              )}

              {referralStatus && (
                <>
                  <div>
                    <div className="text-sm text-muted-foreground">Referral Code</div>
                    <div className="font-mono font-semibold">{referralStatus.code}</div>
                  </div>
                  {referralExpiresAt && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="text-sm text-muted-foreground">Referral Access Expires</div>
                        <div className="font-semibold">{referralExpiresAt.toLocaleDateString()}</div>
                      </div>
                    </div>
                  )}
                </>
              )}

              {!hasActiveAccess && (
                <p className="text-sm text-muted-foreground">
                  You don't have active premium access. Visit the pricing page to subscribe or redeem a referral code below.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        <RedeemReferralCodeCard />

        <AccountProfileEditor userProfile={userProfile} />
      </div>
    </div>
  );
}
