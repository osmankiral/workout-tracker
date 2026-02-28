'use client';

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Loader2 } from "lucide-react";
import { useTranslations } from 'next-intl';

import { Suspense } from 'react';

export default function Home() {
  const t = useTranslations('Landing');

  return (
    <Suspense fallback={<div>{t('loading')}</div>}>
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
      <main className="flex min-h-screen flex-col items-center justify-center p-24 gap-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center p-6 gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-muted-foreground">{t('verifying')}</p>
          </CardContent>
        </Card>
      </main>
    );
  }

  if (isSuccess) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-24 gap-4">
        <Card className="w-full max-w-md border-green-200 bg-green-50">
          <CardHeader className="flex flex-col items-center gap-2">
            <CheckCircle2 className="h-12 w-12 text-green-600" />
            <CardTitle className="text-green-800">{t('verifiedTitle')}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 text-center">
            <p className="text-green-700">
              {t('verifiedMessage')}
            </p>
            <Button asChild className="w-full bg-green-600 hover:bg-green-700">
              <Link href="/dashboard">{t('goToDashboard')}</Link>
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 gap-4">
      <h1 className="text-4xl font-bold">{t('heroTitle')}</h1>
      <p className="text-xl text-muted-foreground">{t('heroSubtitle')}</p>
      <div className="flex gap-4">
        <Link href="/login">
          <Button>{t('login')}</Button>
        </Link>
        <Link href="/register">
          <Button variant="outline">{t('register')}</Button>
        </Link>
      </div>
    </main>
  );
}