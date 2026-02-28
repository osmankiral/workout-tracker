'use client';

import { useMemo, useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, TrendingUp } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface PRTrackerProps {
  logs: any[]; // Replace with proper type
}

export function PRTracker({ logs }: PRTrackerProps) {
  const t = useTranslations('Progress');
  const tDashboard = useTranslations('Dashboard');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const prs = useMemo(() => {
    if (!mounted) return [];
    // Group logs by exercise and find max weight
    const exerciseLogs: Record<string, { name: string, maxWeight: number, date: string }> = {};

    logs.forEach(log => {
      const exerciseName = log.exercise?.name;
      if (!exerciseName) return;

      if (!exerciseLogs[exerciseName]) {
        exerciseLogs[exerciseName] = {
          name: exerciseName,
          maxWeight: 0,
          date: log.performed_at
        };
      }

      if (log.weight > exerciseLogs[exerciseName].maxWeight) {
        exerciseLogs[exerciseName] = {
          name: exerciseName,
          maxWeight: log.weight,
          date: log.performed_at
        };
      }
    });

    // Convert to array and sort by recent PRs (date of the PR)
    return Object.values(exerciseLogs)
        .filter(pr => pr.maxWeight > 0)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 3); // Top 3 recent PRs
  }, [logs, mounted]);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            {tDashboard('personalRecords')}
        </CardTitle>
        <CardDescription>{t('bestLifts')}</CardDescription>
      </CardHeader>
      <CardContent>
        {prs.length > 0 ? (
            <div className="space-y-4">
                {prs.map((pr, index) => (
                    <div key={index} className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0">
                        <div className="space-y-1">
                            <p className="font-medium leading-none">{pr.name}</p>
                            <p className="text-xs text-muted-foreground">
                                {new Date(pr.date).toLocaleDateString()}
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-lg font-bold">{pr.maxWeight} kg</span>
                            <TrendingUp className="h-4 w-4 text-green-500" />
                        </div>
                    </div>
                ))}
            </div>
        ) : (
            <div className="h-[200px] flex flex-col items-center justify-center text-muted-foreground gap-2">
                <Trophy className="h-8 w-8 opacity-20" />
                <p>{t('noPrs')}</p>
            </div>
        )}
      </CardContent>
    </Card>
  );
}
