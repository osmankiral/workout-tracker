import { Metadata } from "next";
import { Activity, Dumbbell, Calendar, Trophy } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { format, startOfWeek, endOfWeek, subDays, isSameDay } from "date-fns";
import { getTranslations } from 'next-intl/server';

import { StatCard } from "@/components/dashboard/StatCard";
import { WeeklyActivityChart } from "@/components/dashboard/WeeklyActivityChart";
import { TodayWorkout } from "@/components/dashboard/TodayWorkout";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { StaggerContainer, StaggerItem, FadeInUp } from "@/components/ui/motion";

export async function generateMetadata({params}: {params: Promise<{locale: string}>}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({locale, namespace: 'Dashboard'});
  return {
    title: `${t('title')} - Workout Tracker`,
    description: "Track your fitness progress",
  };
}

export default async function DashboardPage() {
  const t = await getTranslations('Dashboard');
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return null; // Middleware will handle redirect
  }

  // 1. Fetch Stats
  // Total Workouts
  const { count: totalWorkouts } = await supabase
    .from('workout_sessions')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('is_completed', true);

  // Weekly Volume (sum of reps * weight for all logs this week)
  const startOfCurrentWeek = startOfWeek(new Date()).toISOString();
  const { data: weeklyLogs } = await supabase
    .from('exercise_logs')
    .select('weight, reps')
    .eq('user_id', user.id)
    .gte('performed_at', startOfCurrentWeek);

  const weeklyVolume = weeklyLogs?.reduce((acc, log) => acc + ((log.weight || 0) * (log.reps || 0)), 0) || 0;

  // Active Streak (Consecutive days with completed sessions)
  const { data: recentSessions } = await supabase
    .from('workout_sessions')
    .select('completed_at')
    .eq('user_id', user.id)
    .eq('is_completed', true)
    .order('completed_at', { ascending: false })
    .limit(10);

  let currentStreak = 0;
  if (recentSessions && recentSessions.length > 0) {
    const today = new Date();
    
    // Check if workout done today
    const hasWorkoutToday = recentSessions.some(s => isSameDay(new Date(s.completed_at), today));
    if (hasWorkoutToday) currentStreak++;
    
    // Check previous days
    for (let i = 1; i < 30; i++) { 
        const prevDay = subDays(today, i);
        const hasWorkout = recentSessions.some(s => isSameDay(new Date(s.completed_at), prevDay));
        if (hasWorkout) {
            currentStreak++;
        } else if (i === 1 && !hasWorkoutToday) {
            break;
        } else {
            break;
        }
    }
  }

  // Personal Records (Mock for now)
  const prCount = 0; 

  // 2. Fetch Weekly Activity Data for Chart
  const { data: dailySessionCounts } = await supabase
    .from('workout_sessions')
    .select('completed_at')
    .eq('user_id', user.id)
    .eq('is_completed', true)
    .gte('completed_at', startOfWeek(new Date()).toISOString())
    .lte('completed_at', endOfWeek(new Date()).toISOString());

  // 3. Fetch Recent Activity
  const { data: recentHistory } = await supabase
    .from('workout_sessions')
    .select(`
        *,
        workout:workouts (name)
    `)
    .eq('user_id', user.id)
    .eq('is_completed', true)
    .order('completed_at', { ascending: false })
    .limit(3);

  // 4. Fetch Recent Workouts for Quick Start
  const { data: recentWorkouts } = await supabase
    .from('workouts')
    .select('*, workout_exercises(sets_target, rest_seconds)')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false })
    .limit(5);

  const latestWorkout = recentWorkouts?.[0];

  return (
    <div className="flex-1 space-y-4 p-4 pt-4">
      <StaggerContainer className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <StaggerItem>
            <StatCard
            title={t('totalWorkouts')}
            value={totalWorkouts || 0}
            icon={Dumbbell}
            description={t('lifetimeSessions')}
            />
        </StaggerItem>
        <StaggerItem>
            <StatCard
            title={t('activeStreak')}
            value={`${currentStreak} ${t('days')}`}
            icon={Activity}
            description={t('keepMomentum')}
            trend={currentStreak > 2 ? "On fire! 🔥" : undefined}
            trendDirection="up"
            />
        </StaggerItem>
        <StaggerItem>
            <StatCard
            title={t('weeklyVolume')}
            value={`${(weeklyVolume / 1000).toFixed(1)}k kg`}
            icon={Calendar}
            description={t('totalVolumeThisWeek')}
            />
        </StaggerItem>
        <StaggerItem>
            <StatCard
            title={t('personalRecords')}
            value={prCount}
            icon={Trophy}
            description={t('prsThisMonth')}
            />
        </StaggerItem>
      </StaggerContainer>

      <StaggerContainer className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 mt-8">
        <StaggerItem className="col-span-2 lg:col-span-4 min-h-[350px]">
            <WeeklyActivityChart 
                className="h-full" 
                data={dailySessionCounts?.map(s => s.completed_at) || []} 
            />
        </StaggerItem>
        <StaggerItem className="col-span-2 lg:col-span-3 space-y-4">
          <TodayWorkout workout={latestWorkout} workouts={recentWorkouts || []} />
          <RecentActivity history={recentHistory || []} />
        </StaggerItem>
      </StaggerContainer>
    </div>
  );
}
