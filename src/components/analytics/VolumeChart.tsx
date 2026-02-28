'use client';

import { useMemo, useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from 'recharts';
import { format, parseISO, startOfWeek, endOfWeek, eachWeekOfInterval, subWeeks } from 'date-fns';
import { tr, enUS } from 'date-fns/locale';
import { useTranslations, useLocale } from 'next-intl';

interface VolumeChartProps {
  logs: any[];
}

export function VolumeChart({ logs }: VolumeChartProps) {
  const t = useTranslations('Progress');
  const tCommon = useTranslations('Common');
  const locale = useLocale();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const dateLocale = useMemo(() => {
    return locale === 'tr' ? tr : enUS;
  }, [locale]);

  const chartData = useMemo(() => {
    if (!logs || logs.length === 0) return [];

    // Find date range
    const dates = logs.map(log => parseISO(log.performed_at));
    const minDate = dates.reduce((a, b) => a < b ? a : b);
    const maxDate = new Date(); // Always show up to today
    
    // Ensure we show at least last 4 weeks if data is sparse, or start from first log
    const startDate = minDate < subWeeks(new Date(), 4) ? minDate : subWeeks(new Date(), 4);

    // Generate all weeks in interval
    const weeks = eachWeekOfInterval({
      start: startOfWeek(startDate, { weekStartsOn: 1 }),
      end: endOfWeek(maxDate, { weekStartsOn: 1 })
    }, { weekStartsOn: 1 });

    // Group logs by week
    const volumeByWeek = logs.reduce((acc: Record<string, number>, log: any) => {
      const date = parseISO(log.performed_at);
      const weekStart = format(startOfWeek(date, { weekStartsOn: 1 }), 'yyyy-MM-dd');
      const volume = (log.reps || 0) * (log.weight || 0);
      
      if (!acc[weekStart]) {
        acc[weekStart] = 0;
      }
      acc[weekStart] += volume;
      return acc;
    }, {} as Record<string, number>);

    // Map weeks to data points
    return weeks.map(weekStart => {
      const dateKey = format(weekStart, 'yyyy-MM-dd');
      return {
        date: dateKey,
        volume: volumeByWeek[dateKey] || 0,
        label: format(weekStart, 'd MMM', { locale: dateLocale }),
        fullLabel: `${format(startOfWeek(weekStart, { weekStartsOn: 1 }), 'd MMM', { locale: dateLocale })} - ${format(endOfWeek(weekStart, { weekStartsOn: 1 }), 'd MMM', { locale: dateLocale })}`
      };
    });
  }, [logs, dateLocale]);

  if (!mounted) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>{t('volumeChart')}</CardTitle>
          <CardDescription>{t('totalVolume')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[200px] flex items-center justify-center bg-muted/10 rounded-lg animate-pulse">
            {tCommon('loading')}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>{t('volumeChart')}</CardTitle>
        <CardDescription>{t('totalVolume')}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[200px] w-full">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorVolumeBar" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.8}/>
                    <stop offset="100%" stopColor="var(--primary)" stopOpacity={0.3}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis 
                    dataKey="label" 
                    stroke="var(--muted-foreground)"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    minTickGap={30}
                />
                <YAxis 
                    stroke="var(--muted-foreground)"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value}
                />
                <Tooltip 
                    cursor={{ fill: 'var(--muted)', opacity: 0.2 }}
                    content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                                <div className="rounded-lg border bg-background p-2 shadow-sm">
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="flex flex-col">
                                            <span className="text-[0.70rem] uppercase text-muted-foreground">
                                                {t('week')}
                                            </span>
                                            <span className="font-bold text-muted-foreground">
                                                {data.fullLabel}
                                            </span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[0.70rem] uppercase text-muted-foreground">
                                                {t('volume')}
                                            </span>
                                            <span className="font-bold">
                                                {payload[0].value?.toLocaleString()} kg
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        }
                        return null;
                    }}
                />
                <Bar
                    dataKey="volume" 
                    fill="url(#colorVolumeBar)" 
                    radius={[4, 4, 0, 0]}
                    maxBarSize={50}
                />
              </BarChart>
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
