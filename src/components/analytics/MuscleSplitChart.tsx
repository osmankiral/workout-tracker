'use client';

import { useMemo, useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { useTranslations } from 'next-intl';

interface MuscleSplitChartProps {
  logs: any[];
}

export function MuscleSplitChart({ logs }: MuscleSplitChartProps) {
  const t = useTranslations('Progress');
  const tMuscle = useTranslations('MuscleGroups');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const getMuscleName = (group: string | undefined) => {
    if (!group) return tMuscle('uncategorized');
    try {
        const key = group.toLowerCase().replace(' ', '') as any;
        // Check if key exists in translation by checking if it returns the key itself (basic check)
        // or just rely on next-intl behavior (it returns key if missing)
        return tMuscle(key);
    } catch {
        return group;
    }
  };

  const chartData = useMemo(() => {
    if (!logs || logs.length === 0) return [];

    const distribution: Record<string, number> = {};

    logs.forEach(log => {
      // Use sets if available, otherwise just count the log entry as 1 set equivalent
      // Ideally we would sum up sets from the workout session data, but logs are per exercise
      // If one log entry represents one set (which is common in some schemas), then count is fine.
      // If one log entry represents an exercise performed (with multiple sets), we might want to weigh it.
      // Looking at the schema: exercise_logs has reps/weight/sets? 
      // The types says exercise_logs has reps, weight. Usually one row per set.
      // If it's one row per set, then counting rows is perfect for "volume by sets".
      
      const group = log.exercise?.muscle_group || 'uncategorized';
      if (!distribution[group]) {
        distribution[group] = 0;
      }
      distribution[group] += 1;
    });

    // Convert to array and sort
    return Object.entries(distribution)
      .map(([name, value]) => ({
        name,
        displayName: getMuscleName(name),
        value
      }))
      .sort((a, b) => b.value - a.value);
  }, [logs]);

  // Colors for the chart - distinct colors for better readability
  const COLORS = [
    '#10b981', // Emerald (Green)
    '#3b82f6', // Blue
    '#f59e0b', // Amber (Orange)
    '#ef4444', // Red
    '#8b5cf6', // Violet
    '#06b6d4', // Cyan
    '#ec4899', // Pink
    '#6366f1', // Indigo
  ];

  if (!mounted) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>{t('muscleGroupSplit')}</CardTitle>
          <CardDescription>{t('muscleDistribution')}</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="h-[200px] flex items-center justify-center bg-muted/10 rounded-lg animate-pulse">
                Loading...
            </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>{t('muscleGroupSplit')}</CardTitle>
        <CardDescription>{t('muscleDistribution')}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[200px] w-full">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} strokeWidth={0} />
                  ))}
                </Pie>
                <Tooltip 
                    content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                                <div className="rounded-lg border bg-background p-2 shadow-sm">
                                    <div className="flex flex-col gap-1">
                                        <span className="font-bold text-sm">
                                            {data.displayName}
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                            {data.value} {t('sets')} ({((data.value / logs.length) * 100).toFixed(1)}%)
                                        </span>
                                    </div>
                                </div>
                            );
                        }
                        return null;
                    }}
                />
                <Legend 
                    verticalAlign="bottom" 
                    height={36}
                    formatter={(value, entry: any) => {
                        const item = chartData.find(d => d.name === entry.payload.name);
                        return <span className="text-xs font-medium ml-1">{item?.displayName}</span>;
                    }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground">
              {t('noData')}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
