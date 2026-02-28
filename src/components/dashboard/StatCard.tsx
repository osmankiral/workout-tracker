import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { HoverCard } from "@/components/ui/motion";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trend?: string;
  trendDirection?: 'up' | 'down' | 'neutral';
  className?: string;
}

export function StatCard({ title, value, icon: Icon, description, trend, trendDirection, className }: StatCardProps) {
  return (
    <HoverCard className={cn("h-full", className)}>
      <Card className="h-full border-l-4 border-l-primary overflow-hidden relative group">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-110 duration-500">
            <Icon className="h-24 w-24" />
        </div>
        
        <CardContent className="p-6 flex flex-col justify-between h-full relative z-10">
          <div className="flex items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{title}</h3>
            <div className="p-2 bg-primary/10 rounded-full text-primary">
                <Icon className="h-4 w-4" />
            </div>
          </div>
          
          <div className="space-y-1 mt-4">
            <div className="text-3xl font-bold tracking-tight text-foreground">{value}</div>
            
            <div className="flex items-center gap-2">
                {trend && (
                <span className={cn(
                    "text-xs font-medium px-1.5 py-0.5 rounded",
                    trendDirection === 'up' ? "bg-green-500/10 text-green-500" : 
                    trendDirection === 'down' ? "bg-red-500/10 text-red-500" : 
                    "bg-muted text-muted-foreground"
                )}>
                    {trend}
                </span>
                )}
                {description && (
                <p className="text-xs text-muted-foreground line-clamp-1">{description}</p>
                )}
            </div>
          </div>
        </CardContent>
      </Card>
    </HoverCard>
  );
}
