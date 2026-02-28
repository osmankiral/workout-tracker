'use client';

import { MobileSidebar } from '@/components/dashboard/Sidebar';
import { ModeToggle } from '@/components/ui/mode-toggle';
import { LanguageToggle } from '@/components/ui/language-toggle';
import { UserNav } from '@/components/dashboard/UserNav';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';

interface HeaderProps {
  className?: string;
  user: any;
}

export function Header({ className, user }: HeaderProps) {
  const pathname = usePathname();
  const tSidebar = useTranslations('Sidebar');
  
  // Determine page title based on current path
  const getPageTitle = () => {
    if (pathname.includes('/dashboard')) return tSidebar('dashboard');
    if (pathname.includes('/workouts/builder')) return tSidebar('builder');
    if (pathname.includes('/workouts')) return tSidebar('workouts');
    if (pathname.includes('/progress')) return tSidebar('progress');
    if (pathname.includes('/profile')) return tSidebar('profile');
    
    return 'Workout Tracker';
  };

  return (
    <header className={cn(
      "flex h-16 items-center gap-4 border-b bg-background/80 backdrop-blur-md px-6 z-40 sticky top-0 w-full justify-between",
      className
    )}>
      <div className="flex items-center gap-4">
        <MobileSidebar />
        <div className="font-bold text-lg tracking-tight hidden md:block">
          {getPageTitle()}
        </div>
        <div className="font-bold text-lg tracking-tight md:hidden">
          {getPageTitle()}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <LanguageToggle />
        <ModeToggle />
        <div className="h-6 w-px bg-border mx-2 hidden sm:block" />
        <UserNav user={user} />
      </div>
    </header>
  );
}
