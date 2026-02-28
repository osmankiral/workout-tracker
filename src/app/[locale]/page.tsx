'use client';

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Loader2, Activity, BarChart3, Trophy, Timer, ArrowRight, LayoutDashboard } from "lucide-react";
import { useTranslations } from 'next-intl';
import { motion } from "framer-motion";
import { LanguageToggle } from "@/components/ui/language-toggle";
import { ModeToggle } from "@/components/ui/mode-toggle";

import Image from "next/image";

export default function Home() {
  const t = useTranslations('Landing');

  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-background"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
      <HomeContent />
    </Suspense>
  );
}

function HomeContent() {
  const searchParams = useSearchParams();
  const code = searchParams.get('code');
  const [isVerifying, setIsVerifying] = useState(!!code);
  const [isSuccess, setIsSuccess] = useState(false);
  const t = useTranslations('Landing');

  useEffect(() => {
    if (code) {
      const verifyEmail = async () => {
        try {
          const supabase = createClient();
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (!error) {
            setIsSuccess(true);
          }
        } catch (error) {
          console.error('Verification error:', error);
        } finally {
          setIsVerifying(false);
        }
      };
      verifyEmail();
    }
  }, [code]);

  if (isVerifying) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-background">
        <Card className="w-full max-w-md border-primary/20 shadow-lg">
          <CardContent className="flex flex-col items-center justify-center p-8 gap-6">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-lg text-muted-foreground font-medium">{t('verifying')}</p>
          </CardContent>
        </Card>
      </main>
    );
  }

  if (isSuccess) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-background">
        <Card className="w-full max-w-md border-green-500/20 bg-green-500/5 shadow-lg">
          <CardHeader className="flex flex-col items-center gap-4">
            <div className="rounded-full bg-green-500/20 p-3">
              <CheckCircle2 className="h-12 w-12 text-green-500" />
            </div>
            <CardTitle className="text-2xl font-bold text-green-700 dark:text-green-400">{t('verifiedTitle')}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-6 text-center">
            <p className="text-muted-foreground text-lg">
              {t('verifiedMessage')}
            </p>
            <Button asChild className="w-full h-12 text-lg font-medium bg-green-600 hover:bg-green-700 transition-colors">
              <Link href="/dashboard">{t('goToDashboard')}</Link>
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background selection:bg-primary/20">
      {/* Navbar */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-2 font-bold text-xl text-primary">
            <Activity className="h-6 w-6" />
            <span>WorkoutTracker</span>
          </div>
          <nav className="flex items-center gap-2 md:gap-4">
            <div className="flex items-center gap-2 mr-0 md:mr-2">
              <LanguageToggle />
              <ModeToggle />
            </div>
            <Link href="/login" className="hidden md:inline-flex">
              <Button variant="ghost" className="font-medium hover:text-primary">{t('login')}</Button>
            </Link>
            <Link href="/register" className="hidden md:inline-flex">
              <Button className="font-medium shadow-sm hover:shadow-md transition-all">{t('register')}</Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 flex flex-col">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-10 md:py-20 flex-1 flex flex-col justify-center">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-background to-background"></div>
          <div className="container mx-auto px-4 md:px-6 flex flex-col items-center justify-center flex-1">
            <motion.div 
              className="flex flex-col items-center text-center space-y-8 w-full max-w-4xl mx-auto"
              initial="hidden"
              animate="show"
              variants={container}
            >
              <motion.div variants={item} className="space-y-4 max-w-3xl mx-auto">
                <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/70">
                  {t('heroTitle')}
                </h1>
                <p className="mx-auto max-w-[700px] text-muted-foreground text-lg md:text-xl leading-relaxed">
                  {t('heroSubtitle')}
                </p>
              </motion.div>
              
              <motion.div variants={item} className="flex flex-col sm:flex-row gap-4 w-full justify-center">
                <Button asChild size="lg" className="h-12 px-8 text-lg gap-2 shadow-lg hover:shadow-primary/25 transition-all">
                  <Link href="/register">
                    {t('register')} <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="h-12 px-8 text-lg gap-2 border-primary/20 hover:bg-primary/5">
                  <Link href="/login">
                    {t('login')}
                  </Link>
                </Button>
              </motion.div>

              {/* Dashboard Preview - Screenshot */}
              <motion.div 
                variants={item}
                className="mt-16 w-full max-w-5xl rounded-xl border bg-card shadow-2xl overflow-hidden mx-auto"
              >
                <div className="border-b bg-muted/50 p-4">
                  <div className="flex gap-2">
                    <div className="h-3 w-3 rounded-full bg-red-500/50" />
                    <div className="h-3 w-3 rounded-full bg-yellow-500/50" />
                    <div className="h-3 w-3 rounded-full bg-green-500/50" />
                  </div>
                </div>
                <div className="relative aspect-video w-full bg-muted/50">
                  <div className="dark:hidden w-full h-full">
                    <Image 
                      src="/dashboard.png"
                      alt="Dashboard Preview Light" 
                      width={1200} 
                      height={800}
                      className="w-full h-full object-cover"
                      priority
                    />
                  </div>
                  <div className="hidden dark:block w-full h-full">
                    <Image 
                      src="/dashboarddark.png"
                      alt="Dashboard Preview Dark" 
                      width={1200} 
                      height={800}
                      className="w-full h-full object-cover"
                      priority
                    />
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-muted/30 border-y">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid gap-12 lg:grid-cols-3">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                viewport={{ once: true }}
                className="flex flex-col items-center text-center space-y-4 p-6 rounded-2xl bg-background border hover:border-primary/50 transition-colors shadow-sm"
              >
                <div className="p-3 rounded-full bg-primary/10 text-primary">
                  <LayoutDashboard className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold">{t('features.track.title')}</h3>
                <p className="text-muted-foreground">
                  {t('features.track.description')}
                </p>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                viewport={{ once: true }}
                className="flex flex-col items-center text-center space-y-4 p-6 rounded-2xl bg-background border hover:border-primary/50 transition-colors shadow-sm"
              >
                <div className="p-3 rounded-full bg-primary/10 text-primary">
                  <BarChart3 className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold">{t('features.analytics.title')}</h3>
                <p className="text-muted-foreground">
                  {t('features.analytics.description')}
                </p>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                viewport={{ once: true }}
                className="flex flex-col items-center text-center space-y-4 p-6 rounded-2xl bg-background border hover:border-primary/50 transition-colors shadow-sm"
              >
                <div className="p-3 rounded-full bg-primary/10 text-primary">
                  <Trophy className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold">{t('features.pr.title')}</h3>
                <p className="text-muted-foreground">
                  {t('features.pr.description')}
                </p>
              </motion.div>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-6 md:py-0 border-t bg-background">
        <div className="container mx-auto flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row px-4 md:px-6">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            © 2024 WorkoutTracker. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
