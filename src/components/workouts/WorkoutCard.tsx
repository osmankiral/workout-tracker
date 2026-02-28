'use client';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Edit, Clock, Dumbbell, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface WorkoutCardProps {
  id: string;
  title: string;
  description?: string;
  duration: number; // minutes
  exerciseCount: number;
  lastPerformed?: string;
}

import { useTranslations } from 'next-intl';

export function WorkoutCard({ id, title, description, duration, exerciseCount, lastPerformed }: WorkoutCardProps) {
  const t = useTranslations('Workouts');
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    const supabase = createClient();
    
    try {
      const { error } = await supabase
        .from('workouts')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success(t('deleteSuccess'));
      router.refresh();
    } catch (error) {
      console.error('Error deleting workout:', error);
      toast.error(t('deleteError'));
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Card className="flex flex-col h-full relative group">
      <div className="absolute top-2 right-2">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10">
              <Trash2 className="h-4 w-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t('confirmDeleteTitle')}</AlertDialogTitle>
              <AlertDialogDescription>
                {t('confirmDeleteDescription')}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                {isDeleting ? t('deleting') : t('delete')}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description || t('noDescription')}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="flex justify-between text-sm text-muted-foreground mb-4">
          <div className="flex items-center">
            <Clock className="mr-1 h-4 w-4" />
            <span>{duration} {t('min')}</span>
          </div>
          <div className="flex items-center">
            <Dumbbell className="mr-1 h-4 w-4" />
            <span>{exerciseCount} {t('exercises')}</span>
          </div>
        </div>
        {lastPerformed && (
          <p className="text-xs text-muted-foreground">
            {t('lastPerformed')}: {lastPerformed}
          </p>
        )}
      </CardContent>
      <CardFooter className="flex gap-2">
         <Button variant="outline" size="sm" asChild className="flex-1">
            <Link href={`/workouts/builder?id=${id}`}>
              <Edit className="mr-2 h-4 w-4" />
              {t('edit')}
            </Link>
         </Button>
         <Button size="sm" asChild className="flex-1">
            <Link href={`/workouts/active/${id}`}>
              <Play className="mr-2 h-4 w-4" />
              {t('start')}
            </Link>
         </Button>
      </CardFooter>
    </Card>
  )
}
