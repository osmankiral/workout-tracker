'use client';

import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from '@/i18n/routing';
import { useTranslations } from 'next-intl';

export function SignOutButton() {
  const router = useRouter();
  const t = useTranslations('Profile');
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  return (
    <Button 
      variant="ghost" 
      className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50"
      onClick={handleSignOut}
    >
      <LogOut className="mr-2 h-4 w-4" />
      {t('signOut')}
    </Button>
  );
}