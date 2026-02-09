import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useUpdateUserProfile } from '../hooks/useUserProfile';
import { toast } from 'sonner';
import { User, Info } from 'lucide-react';
import type { UserProfile } from '../backend';

interface AccountProfileEditorProps {
  userProfile: UserProfile | null | undefined;
}

export default function AccountProfileEditor({ userProfile }: AccountProfileEditorProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const updateProfile = useUpdateUserProfile();

  useEffect(() => {
    if (userProfile) {
      setName(userProfile.name || '');
      setEmail(userProfile.email || '');
    }
  }, [userProfile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Name is required');
      return;
    }

    try {
      await updateProfile.mutateAsync({
        name: name.trim(),
        email: email.trim() || null,
      });
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error('Failed to update profile');
      console.error(error);
    }
  };

  return (
    <Card className="border-cash-gold/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5 text-cash-gold" />
          Edit Profile
        </CardTitle>
        <CardDescription>Update your name and email</CardDescription>
      </CardHeader>
      <CardContent>
        <Alert className="mb-4 border-blue-500/20 bg-blue-500/5">
          <Info className="h-4 w-4 text-blue-500" />
          <AlertDescription className="text-sm">
            Your email is stored in your profile for your records. It does not change your Internet Identity login method.
          </AlertDescription>
        </Alert>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-name">Name *</Label>
            <Input
              id="edit-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-email">Email (optional)</Label>
            <Input
              id="edit-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
            />
          </div>
          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-cash-green to-cash-gold hover:opacity-90 text-black font-semibold"
            disabled={updateProfile.isPending}
          >
            {updateProfile.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
