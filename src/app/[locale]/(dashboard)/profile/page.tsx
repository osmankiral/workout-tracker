import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, Settings, CreditCard } from 'lucide-react';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { SignOutButton } from '@/components/auth/SignOutButton';

export async function generateMetadata({params}: {params: Promise<{locale: string}>}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({locale, namespace: 'Profile'});
  return {
    title: `${t('title')} - Workout Tracker`,
    description: 'Manage your profile and settings',
  };
}

export default async function ProfilePage() {
  const t = await getTranslations('Profile');
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch user profile data if we had a profiles table, or just use auth metadata
  // For now we use auth data

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">{t('title')}</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('userInfo')}</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4 py-4">
              <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center">
                <span className="text-2xl font-bold">
                  {user.email?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="text-lg font-medium">{user.user_metadata?.username || 'User'}</p>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('subscription')}</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{t('plan')}</span>
              <span className="text-sm text-muted-foreground">{t('freeTier')}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{t('status')}</span>
              <span className="text-sm text-green-500">{t('active')}</span>
            </div>
            <Button variant="outline" className="w-full">{t('upgradeToPro')}</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('accountActions')}</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="space-y-2 pt-4">
            <SignOutButton />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
