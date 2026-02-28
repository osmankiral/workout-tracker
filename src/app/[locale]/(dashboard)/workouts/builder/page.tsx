import { Metadata } from 'next';
import { WorkoutBuilder } from '@/components/workouts/builder/WorkoutBuilder';
import { Suspense } from 'react';
import { getTranslations } from 'next-intl/server';

import { useTranslations } from 'next-intl';

export async function generateMetadata({params: {locale}}: {params: {locale: string}}): Promise<Metadata> {
  const t = await getTranslations({locale, namespace: 'Builder'});
  return {
    title: `${t('title')} - Workout Tracker`,
    description: "Create your custom workout plan",
  };
}

export default function WorkoutBuilderPage() {
  const t = useTranslations('Builder');
  return (
    <Suspense fallback={<div>{t('loading')}</div>}>
      <WorkoutBuilder />
    </Suspense>
  );
}
