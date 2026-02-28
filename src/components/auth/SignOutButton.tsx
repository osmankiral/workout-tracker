'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { LogOut, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from '@/i18n/routing';
import { useTranslations } from 'next-intl';

export function SignOutButton() {
  const router = useRouter();
  const t = useTranslations('Profile');
  const supabase = createClient();
  const [isLoading, setIsLoading] = useState(false);

  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      await supabase.auth.signOut();
      router.push('/login');
      router.refresh();
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      // Don't set loading to false here because we're redirecting
      // and we want to prevent multiple clicks
    }
  };

  return (
    <Button 
      variant="ghost" 
      className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50"
      onClick={handleSignOut}
      disabled={isLoading}
    >
      {isLoading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <LogOut className="mr-2 h-4 w-4" />
      )}
      {t('signOut')}
    </Button>
  );
}
