'use client';

import { useMemo, useState, useEffect } from 'react';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { startOfWeek, endOfWeek, eachDayOfInterval, format, isSameDay, parseISO } from 'date-fns';
import { tr, enUS } from 'date-fns/locale';
import { useTranslations, useLocale } from 'next-intl';
import { HoverCard } from "@/components/ui/motion";

interface WeeklyActivityChartProps {
  className?: string;
  data: string[]; // Array of completed_at timestamps
}

export function WeeklyActivityChart({ className, data }: WeeklyActivityChartProps) {
  const t = useTranslations('Dashboard');
  const locale = useLocale();
  const dateLocale = locale === 'tr' ? tr : enUS;
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const chartData = useMemo(() => {
    // If not mounted, return empty or safe default
    // We handle loading state below, but for SSR safety:
    if (typeof window === 'undefined') return [];

    const today = new Date();
    // Default to current week
    const start = startOfWeek(today, { weekStartsOn: 1 }); // Monday start
    const end = endOfWeek(today, { weekStartsOn: 1 });
    
    const days = eachDayOfInterval({ start, end });

    // Count workouts per day
    const counts = days.map(day => {
        // Filter data for this day
        // Ensure we parse timestamps correctly
        const count = data ? data.filter(timestamp => {
            try {
                return isSameDay(new Date(timestamp), day);
            } catch (e) {
                return false;
            }
        }).length : 0;
        
        return {
            name: format(day, 'EEE', { locale: dateLocale }),
            total: count,
            fullDate: format(day, 'd MMMM yyyy', { locale: dateLocale }),
            // Add a fill color property for potential individual styling
            fill: count > 0 ? "url(#colorUv)" : "var(--muted)" 
        };
    });
    
    return counts;
  }, [data, dateLocale]);

  if (!mounted) {
    return (
        <HoverCard className={className}>
            <Card className="h-full">
                <CardHeader>
                    <CardTitle>{t('weeklyActivity')}</CardTitle>
                    <CardDescription>{t('workoutsPerformed')}</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px] flex items-center justify-center bg-muted/5 animate-pulse rounded-xl mx-6 mb-6">
                    <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                </CardContent>
            </Card>
        </HoverCard>
    );
  }

  return (
    <HoverCard className={className}>
      <Card className="h-full border-primary/10 flex flex-col overflow-hidden bg-gradient-to-br from-card via-card to-muted/20">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
                <CardTitle>{t('weeklyActivity')}</CardTitle>
                <CardDescription>{t('workoutsPerformed')}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-1 min-h-0 pl-0 pr-6 pb-4 pt-4">
          <div className="h-full w-full">
            <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <defs>
                    <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="var(--primary)" stopOpacity={0.1}/>
                    </linearGradient>
                    <linearGradient id="bgGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--muted)" stopOpacity={0.05}/>
                        <stop offset="100%" stopColor="var(--muted)" stopOpacity={0}/>
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.4} />
                <XAxis
                    dataKey="name"
                    stroke="var(--muted-foreground)"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    dy={10}
                />
                <YAxis
                    stroke="var(--muted-foreground)"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${value}`}
                    allowDecimals={false}
                    dx={-10}
                />
                <Tooltip 
                    cursor={{fill: 'url(#bgGradient)', radius: 4}}
                    contentStyle={{ 
                        backgroundColor: 'var(--popover)', 
                        borderColor: 'var(--border)', 
                        borderRadius: 'var(--radius)',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }}
                    itemStyle={{ color: 'var(--primary)', fontWeight: 600 }}
                    labelStyle={{ color: 'var(--muted-foreground)', marginBottom: '0.25rem' }}
                    labelFormatter={(label, payload) => {
                        if (payload && payload.length > 0 && payload[0].payload) {
                            return payload[0].payload.fullDate;
                        }
                        return label;
                    }}
                />
                <Bar
                    dataKey="total"
                    name={t('workouts')}
                    radius={[8, 8, 0, 0]}
                    fill="url(#colorUv)"
                    barSize={50}
                    animationDuration={1500}
                />
            </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </HoverCard>
  )
}
