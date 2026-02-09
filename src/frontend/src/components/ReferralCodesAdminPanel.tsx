import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Copy, Ticket, Trash2, Plus } from 'lucide-react';
import {
  useListReferralCodes,
  useCreateReferralCode,
  useRevokeReferralCode,
} from '../hooks/useReferralCodes';

export default function ReferralCodesAdminPanel() {
  const { data: referralCodes = [], isLoading } = useListReferralCodes();
  const createCode = useCreateReferralCode();
  const revokeCode = useRevokeReferralCode();

  const [newCode, setNewCode] = useState('');
  const [durationDays, setDurationDays] = useState('30');
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);

  const handleGenerateCode = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newCode.trim()) {
      toast.error('Please enter a code');
      return;
    }

    const days = parseInt(durationDays);
    if (isNaN(days) || days <= 0) {
      toast.error('Please enter a valid duration in days');
      return;
    }

    try {
      // Convert days to nanoseconds
      const validForNs = BigInt(days * 24 * 60 * 60 * 1_000_000_000);
      await createCode.mutateAsync({ code: newCode, validForNs });
      setGeneratedCode(newCode);
      toast.success('Referral code created successfully');
      setNewCode('');
      setDurationDays('30');
    } catch (error: any) {
      toast.error(error.message || 'Failed to create referral code');
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success('Code copied to clipboard');
  };

  const handleRevokeCode = async (code: string) => {
    try {
      await revokeCode.mutateAsync(code);
      toast.success('Referral code revoked');
      if (generatedCode === code) {
        setGeneratedCode(null);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to revoke code');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cash-gold"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-cash-gold" />
            Generate Referral Code
          </CardTitle>
          <CardDescription>Create a new referral code with custom premium access duration</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleGenerateCode} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="code">Referral Code *</Label>
                <Input
                  id="code"
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value)}
                  placeholder="WELCOME2025"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration">Premium Access Duration (days) *</Label>
                <Input
                  id="duration"
                  type="number"
                  min="1"
                  value={durationDays}
                  onChange={(e) => setDurationDays(e.target.value)}
                  placeholder="30"
                  required
                />
              </div>
            </div>
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-cash-green to-cash-gold hover:opacity-90 text-black font-semibold"
              disabled={createCode.isPending}
            >
              {createCode.isPending ? 'Generating...' : 'Generate Code'}
            </Button>
          </form>

          {generatedCode && (
            <div className="mt-6 p-4 bg-cash-gold/10 border border-cash-gold/20 rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-muted-foreground">Generated Code</div>
                  <div className="text-2xl font-bold font-mono text-cash-gold">{generatedCode}</div>
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleCopyCode(generatedCode)}
                  className="border-cash-gold/30 hover:bg-cash-gold/10"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Share this code with users to grant them premium access
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ticket className="h-5 w-5 text-cash-gold" />
            Active Referral Codes
          </CardTitle>
          <CardDescription>Manage existing referral codes</CardDescription>
        </CardHeader>
        <CardContent>
          {referralCodes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No active referral codes. Generate one above to get started.
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Valid Until</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {referralCodes.map((code) => {
                    const expiresAt = new Date(Number(code.validUntil) / 1000000);
                    const isExpired = expiresAt < new Date();
                    return (
                      <TableRow key={code.code}>
                        <TableCell className="font-mono font-semibold">{code.code}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span>{expiresAt.toLocaleDateString()}</span>
                            {isExpired && (
                              <Badge variant="outline" className="text-xs">
                                Expired
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleCopyCode(code.code)}
                              className="h-8 w-8"
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRevokeCode(code.code)}
                              disabled={revokeCode.isPending}
                              className="h-8 w-8 text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
