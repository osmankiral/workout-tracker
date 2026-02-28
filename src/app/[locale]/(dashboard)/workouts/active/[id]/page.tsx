import { ActiveWorkoutLoader } from '@/components/workouts/active/ActiveWorkoutLoader';
import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({params: {locale}}: {params: {locale: string}}): Promise<Metadata> {
  const t = await getTranslations({locale, namespace: 'ActiveWorkout'});
  return {
    title: `${t('metaTitle')} - Workout Tracker`,
    description: t('metaDescription'),
  };
}

export default async function ActiveWorkoutPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  
  return <ActiveWorkoutLoader workoutId={id} />;
}
