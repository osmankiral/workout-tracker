import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { VolumeChart } from '@/components/analytics/VolumeChart';
import { WorkoutFrequency } from '@/components/analytics/WorkoutFrequency';
import { PRTracker } from '@/components/analytics/PRTracker';
import { MuscleSplitChart } from '@/components/analytics/MuscleSplitChart';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({params}: {params: Promise<{locale: string}>}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({locale, namespace: 'Progress'});
  return {
    title: `${t('title')} - Workout Tracker`,
    description: 'Analyze your workout progress',
  };
}

export default async function ProgressPage() {
  const t = await getTranslations('Progress');
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return <div>{t('loginRequired')}</div>;
  }

  // Fetch workout sessions for analytics
  const { data: sessions } = await supabase
    .from('workout_sessions')
    .select(`
      *,
      workout:workouts (name)
    `)
    .eq('user_id', user.id)
    .eq('is_completed', true)
    .order('completed_at', { ascending: true }); // Ascending for charts

  // Fetch exercise logs for volume calculation
  // In a real app with many logs, we might want to use aggregation queries or edge functions
  const { data: logs } = await supabase
    .from('exercise_logs')
    .select(`
        *,
        exercise:exercises (name, muscle_group)
    `)
    .eq('user_id', user.id)
    .order('performed_at', { ascending: true });

  return (
    <div className="flex-1 space-y-4 p-4">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">{t('title')}</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-4">
            <VolumeChart logs={logs || []} />
        </div>
        <div className="col-span-3">
            <WorkoutFrequency sessions={sessions || []} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
        <PRTracker logs={logs || []} />
        
        <MuscleSplitChart logs={logs || []} />
      </div>
    </div>
  );
}
