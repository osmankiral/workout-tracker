import { Button } from "@/components/ui/button";
import { Plus, Dumbbell } from "lucide-react";
import { Link } from "@/i18n/routing";
import { WorkoutCard } from "@/components/workouts/WorkoutCard";
import { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { getTranslations } from 'next-intl/server';
import { calculateWorkoutDuration } from "@/lib/workout-utils";

export async function generateMetadata({params: {locale}}: {params: {locale: string}}): Promise<Metadata> {
  const t = await getTranslations({locale, namespace: 'Workouts'});
  return {
    title: `${t('title')} - Workout Tracker`,
    description: t('description'),
  };
}

export default async function WorkoutsPage({params}: {params: Promise<{locale: string}>}) {
  const {locale} = await params;
  const t = await getTranslations({locale, namespace: 'Workouts'});
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="flex-1 p-8 text-center">
        <p>{t('loginRequired')}</p>
      </div>
    );
  }

  const { data: workouts, error } = await supabase
    .from('workouts')
    .select(`
      *,
      workout_exercises (
        id,
        sets_target,
        rest_seconds
      ),
      workout_sessions (
        started_at
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching workouts:', error);
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">{t('title')}</h2>
        <Button asChild>
          <Link href="/workouts/builder">
            <Plus className="mr-2 h-4 w-4" />
            {t('createNew')}
          </Link>
        </Button>
      </div>
      
      {workouts && workouts.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {workouts.map((workout) => {
            const lastPerformedDate = workout.workout_sessions?.length 
                ? new Date(Math.max(...workout.workout_sessions.map((s: any) => new Date(s.started_at).getTime())))
                : null;

            return (
              <WorkoutCard 
                key={workout.id}
                id={workout.id} 
                title={workout.name} 
                description={workout.description || ''} 
                duration={calculateWorkoutDuration(workout)}
                exerciseCount={workout.workout_exercises?.length || 0} 
                lastPerformed={lastPerformedDate ? new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(lastPerformedDate) : undefined} 
              />
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-[50vh] border rounded-lg bg-muted/10 border-dashed">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
            <Dumbbell className="h-10 w-10 text-muted-foreground" />
          </div>
          <h3 className="mt-4 text-lg font-semibold">{t('title')}</h3>
          <p className="mb-4 mt-2 text-sm text-muted-foreground max-w-sm text-center">
            {t('description')}
          </p>
          <Button asChild>
            <Link href="/workouts/builder">
              <Plus className="mr-2 h-4 w-4" />
              {t('createNew')}
            </Link>
          </Button>
        </div>
      )}
    </div>
  )
}
