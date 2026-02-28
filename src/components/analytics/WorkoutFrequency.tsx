'use client';

import { useMemo, useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { eachDayOfInterval, endOfWeek, format, isSameDay, startOfWeek, subWeeks } from 'date-fns';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useTranslations } from 'next-intl';

interface WorkoutFrequencyProps {
  sessions: any[]; // Replace with proper type
}

export function WorkoutFrequency({ sessions }: WorkoutFrequencyProps) {
  const t = useTranslations('Progress');
  const tCommon = useTranslations('Common');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const calendarData = useMemo(() => {
    if (!mounted) return [];
    const today = new Date();
    const startDate = startOfWeek(subWeeks(today, 11)); // Last 12 weeks
    const endDate = endOfWeek(today);

    const days = eachDayOfInterval({ start: startDate, end: endDate });

    return days.map(day => {
      const sessionCount = sessions.filter(s => isSameDay(new Date(s.completed_at), day)).length;
      return {
        date: day,
        count: sessionCount,
        level: Math.min(sessionCount, 4) // 0-4 intensity levels
      };
    });
  }, [sessions, mounted]);

  if (!mounted) return null;

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>{t('consistency')}</CardTitle>
        <CardDescription>{t('frequencyDescription')}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-1 justify-center">
            {/* Days grid - simplifed version of GitHub contribution graph */}
            <TooltipProvider>
                {calendarData.map((day, i) => (
                    <Tooltip key={i}>
                        <TooltipTrigger>
                            <div 
                                className={cn(
                                    "w-3 h-3 rounded-sm",
                                    day.level === 0 ? "bg-muted" : 
                                    day.level === 1 ? "bg-green-200 dark:bg-green-900" :
                                    day.level === 2 ? "bg-green-400 dark:bg-green-700" :
                                    day.level === 3 ? "bg-green-600 dark:bg-green-500" :
                                    "bg-green-800 dark:bg-green-300"
                                )}
                            />
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>{format(day.date, 'MMM d, yyyy')}: {day.count} {tCommon('success') === 'Success' ? 'workouts' : 'antrenman'}</p>
                        </TooltipContent>
                    </Tooltip>
                ))}
            </TooltipProvider>
        </div>
        <div className="mt-4 flex items-center justify-end gap-2 text-xs text-muted-foreground">
            <span>{t('less')}</span>
            <div className="flex gap-1">
                <div className="w-3 h-3 rounded-sm bg-muted" />
                <div className="w-3 h-3 rounded-sm bg-green-200 dark:bg-green-900" />
                <div className="w-3 h-3 rounded-sm bg-green-400 dark:bg-green-700" />
                <div className="w-3 h-3 rounded-sm bg-green-600 dark:bg-green-500" />
                <div className="w-3 h-3 rounded-sm bg-green-800 dark:bg-green-300" />
            </div>
            <span>{t('more')}</span>
        </div>
      </CardContent>
    </Card>
  );
}
