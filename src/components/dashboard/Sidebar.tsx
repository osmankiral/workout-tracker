'use client';

import { usePathname, useRouter } from '@/i18n/routing';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import {
  LayoutDashboard,
  Dumbbell,
  LineChart,
  User,
  Settings,
  Menu,
  PlusCircle,
  Timer,
  Activity
} from 'lucide-react';
import { useState } from 'react';
import { ModeToggle } from '@/components/ui/mode-toggle';
import { LanguageToggle } from '@/components/ui/language-toggle';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { motion } from 'framer-motion';
import { useWorkoutStore } from '@/stores/workoutStore';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations('Sidebar');
  const tCommon = useTranslations('Common');
  const tActive = useTranslations('ActiveWorkout');
  
  const { activeWorkout, cancelWorkout } = useWorkoutStore();
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [pendingRoute, setPendingRoute] = useState<string | null>(null);

  const handleNavigation = (e: React.MouseEvent, href: string) => {
    // Check if we are on the active workout page
    const isActiveWorkoutPage = pathname.includes('/workouts/active');
    
    if (isActiveWorkoutPage && activeWorkout && !activeWorkout.is_completed) {
      e.preventDefault();
      setPendingRoute(href);
      setShowExitDialog(true);
    }
  };

  const confirmExit = () => {
    if (pendingRoute) {
      cancelWorkout();
      router.push(pendingRoute);
      setShowExitDialog(false);
      setPendingRoute(null);
    }
  };

  const routes = [
    {
      label: t('dashboard'),
      icon: LayoutDashboard,
      href: '/dashboard',
    },
    {
      label: t('workouts'),
      icon: Dumbbell,
      href: '/workouts',
    },
    {
      label: t('builder'),
      icon: PlusCircle,
      href: '/workouts/builder',
    },
    {
      label: t('progress'),
      icon: LineChart,
      href: '/progress',
    },
    {
      label: t('profile'),
      icon: User,
      href: '/profile',
    },
  ];

  return (
    <div className={cn("pb-12 h-full flex flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border", className)}>
      <div className="space-y-6 py-6 flex-1">
        <div className="px-6 flex items-center justify-between">
          <Link 
            href="/dashboard" 
            className="flex items-center gap-2 group"
            onClick={(e) => handleNavigation(e, '/dashboard')}
          >
            <div className="bg-primary/20 p-2 rounded-xl group-hover:bg-primary/30 transition-colors">
              <Activity className="h-6 w-6 text-primary" />
            </div>
            <h2 className="text-xl font-bold tracking-tight text-foreground group-hover:text-primary transition-colors">
              {tCommon('appName')}
            </h2>
          </Link>
        </div>
        
        <div className="px-4 space-y-1">
          {routes.map((route) => {
            const isActive = pathname === route.href || pathname.endsWith(route.href);
            return (
              <Link
                key={route.href}
                href={route.href}
                onClick={(e) => handleNavigation(e, route.href)}
                className={cn(
                  "relative flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 group overflow-hidden",
                  isActive 
                    ? "text-primary-foreground bg-primary shadow-lg shadow-primary/25" 
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                <route.icon className={cn("h-5 w-5 z-10 relative", isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-primary")} />
                <span className="z-10 relative">{route.label}</span>
                
                {/* Active Glow Effect (Optional subtle background animation could go here) */}
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute inset-0 bg-primary z-0"
                    initial={false}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </Link>
            )
          })}
        </div>
      </div>

      <AlertDialog open={showExitDialog} onOpenChange={setShowExitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{tActive('cancelWorkoutTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {tActive('cancelWorkoutDescription')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
                setShowExitDialog(false);
                setPendingRoute(null);
            }}>{tActive('continueWorkout')}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmExit} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {tActive('confirmCancel')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export function MobileSidebar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden text-muted-foreground">
          <Menu className="h-6 w-6" />
          <span className="sr-only">Toggle Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0 border-r-sidebar-border bg-sidebar w-72">
        <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
        <SheetDescription className="sr-only">Main navigation menu for mobile devices</SheetDescription>
        <Sidebar className="border-none" />
      </SheetContent>
    </Sheet>
  );
}
