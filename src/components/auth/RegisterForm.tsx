'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

import { useTranslations } from 'next-intl';

export default function RegisterForm() {
  const t = useTranslations('Auth');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const formSchema = z.object({
    email: z.string().email({
      message: t('errors.invalidEmail'),
    }),
    password: z.string().min(6, {
      message: t('errors.passwordMin'),
    }),
    confirmPassword: z.string(),
    username: z.string().min(3, {
      message: t('errors.usernameMin'),
    }),
  }).refine((data) => data.password === data.confirmPassword, {
    message: t('errors.passwordsNoMatch'),
    path: ["confirmPassword"],
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      username: "",
    },
  });

  const [isSuccess, setIsSuccess] = useState(false);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setError(null);

    try {
      const { error: signUpError } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: {
            username: values.username,
          },
        },
      });

      if (signUpError) {
        throw signUpError;
      }

      // Show success message instead of redirecting
      setIsSuccess(true);
    } catch (err: any) {
      setError(t('errors.generic')); // Using generic error for simplicity or handle specific errors
    } finally {
      setIsLoading(false);
    }
  }

  if (isSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full"
      >
        <Card className="w-full border-green-500/20 bg-green-500/5 shadow-lg">
          <CardHeader>
            <CardTitle className="text-green-700 dark:text-green-400">{t('checkEmailTitle')}</CardTitle>
            <CardDescription className="text-green-600/80 dark:text-green-400/80" dangerouslySetInnerHTML={{ __html: t.raw('checkEmailDescription').replace('{email}', form.getValues().email) }} />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-green-100/50 dark:bg-green-900/20 text-green-700 dark:text-green-300 p-4 rounded-md text-sm border border-green-200 dark:border-green-800">
              {t('checkEmailMessage')}
            </div>
            <Button asChild className="w-full bg-green-600 hover:bg-green-700 text-white">
              <Link href="/login">
                {t('backToLogin')}
              </Link>
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full"
    >
      <Card className="w-full border-none shadow-none bg-transparent">
        <CardHeader className="space-y-1 px-0">
          <CardTitle className="text-2xl font-bold tracking-tight">{t('registerTitle')}</CardTitle>
          <CardDescription>
            {t('registerDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent className="px-0">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('usernameLabel')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('usernamePlaceholder')} {...field} className="h-11" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('emailLabel')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('emailPlaceholder')} {...field} className="h-11" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('passwordLabel')}</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder={t('passwordPlaceholder')} {...field} className="h-11" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('confirmPasswordLabel')}</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder={t('passwordPlaceholder')} {...field} className="h-11" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="text-sm font-medium text-destructive bg-destructive/10 p-3 rounded-md"
                >
                  {error}
                </motion.div>
              )}
              <Button type="submit" className="w-full h-11" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('creatingAccount')}
                  </>
                ) : (
                  t('registerButton')
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="px-0 flex flex-col gap-4">
          <div className="text-center text-sm text-muted-foreground">
            {t('hasAccount')}{' '}
            <Link href="/login" className="font-medium text-primary hover:underline underline-offset-4">
              {t('loginButton')}
            </Link>
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
