import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Clock, CalendarDays } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { tr, enUS } from "date-fns/locale";
import { useLocale, useTranslations } from "next-intl";
import { StaggerContainer, StaggerItem, HoverCard } from "@/components/ui/motion";

interface RecentActivityProps {
  className?: string;
  history: any[]; // Replace with proper type
}

export function RecentActivity({ className, history }: RecentActivityProps) {
  const t = useTranslations('Dashboard');
  const tWorkouts = useTranslations('Workouts');
  const locale = useLocale();
  const dateLocale = locale === 'tr' ? tr : enUS;

  return (
    <HoverCard className={className}>
      <Card className="h-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
                <CardTitle>{t('recentHistory')}</CardTitle>
                <CardDescription>
                {t('lastWorkouts', {count: history.length})}
                </CardDescription>
            </div>
            <CalendarDays className="h-5 w-5 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardContent className="pr-1">
          {history.length > 0 ? (
              <div className="max-h-[150px] overflow-y-auto pr-3 relative custom-scrollbar">
                <StaggerContainer className="space-y-6 relative pl-2 pb-2">
                    {/* Timeline line */}
                    <div className="absolute left-[19px] top-2 bottom-4 w-0.5 bg-border z-0" />
                    
                    {history.map((session: any) => (
                        <StaggerItem key={session.id} className="relative z-10">
                        <div className="flex items-start group">
                            <div className="bg-background p-1 rounded-full border border-border group-hover:border-primary transition-colors duration-300 mr-4">
                                <CheckCircle2 className="h-6 w-6 text-primary" />
                            </div>
                            <div className="space-y-1 flex-1 p-3 rounded-lg bg-muted/30 group-hover:bg-muted/60 transition-colors duration-200">
                                <div className="flex justify-between items-start gap-2">
                                    <p className="font-semibold text-foreground line-clamp-1">{session.workout?.name || t('unknownWorkout')}</p>
                                    <span className="text-xs text-muted-foreground whitespace-nowrap bg-background px-2 py-0.5 rounded-full border shrink-0">
                                        {formatDistanceToNow(new Date(session.completed_at), { addSuffix: true, locale: dateLocale })}
                                    </span>
                                </div>
                                <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1">
                                    <span className="flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        {Math.floor((session.total_duration_seconds || 0) / 60)} {tWorkouts('min')}
                                    </span>
                                    {/* Add more stats here if available like volume or PRs */}
                                </div>
                            </div>
                        </div>
                    </StaggerItem>
                ))}
              </StaggerContainer>
              </div>
          ) : (
              <div className="h-[200px] flex flex-col items-center justify-center text-muted-foreground bg-muted/10 rounded-lg border border-dashed">
                  <p>{t('noRecentActivity')}</p>
              </div>
          )}
        </CardContent>
      </Card>
    </HoverCard>
  )
}
