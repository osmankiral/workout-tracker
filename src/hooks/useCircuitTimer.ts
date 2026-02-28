import { useState, useEffect, useRef, useCallback } from 'react';

interface UseCircuitTimerProps {
  duration: number;
  onComplete: () => void;
  key?: string | number; // Added key to force reset
}

export function useCircuitTimer({ duration, onComplete, key }: UseCircuitTimerProps) {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Reset timer when duration or key changes
  useEffect(() => {
    setTimeLeft(duration);
    setIsPaused(false);
  }, [duration, key]);

  useEffect(() => {
    if (isPaused || timeLeft <= 0) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Timer finished
          if (timerRef.current) clearInterval(timerRef.current);
          
          // Use a flag to prevent multiple calls
          // But here we rely on state update.
          // The issue might be that onComplete triggers a state update in parent
          // which unmounts or re-renders this hook with new duration
          // but if onComplete is async or slow, we might get stuck at 0.
          
          // Critical fix: Ensure onComplete is called exactly once when hitting 0
          // We do this by checking if we are already at 0 before decrementing
          // But inside setState callback we only see 'prev'.
          
          // Let's call onComplete immediately
          onComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, timeLeft, onComplete]);

  const togglePause = useCallback(() => setIsPaused(prev => !prev), []);
  
  const skip = useCallback(() => {
    setTimeLeft(0);
    setTimeout(() => onComplete(), 0);
  }, [onComplete]);

  const progress = ((duration - timeLeft) / duration) * 100;

  return { timeLeft, isPaused, togglePause, skip, progress };
}
