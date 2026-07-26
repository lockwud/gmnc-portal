import { useState, useEffect } from 'react';

export function useCountdown(targetDate: string | Date | null) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isLive: boolean;
    isPast: boolean;
  } | null>(null);

  useEffect(() => {
    const updateTimeLeft = (target: number) => {
      const currentDiff = target - Date.now();

      if (currentDiff <= 0 && currentDiff > -2 * 60 * 60 * 1000) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isLive: true, isPast: false });
      } else if (currentDiff <= -2 * 60 * 60 * 1000) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isLive: false, isPast: true });
      } else {
        const totalSeconds = Math.floor(currentDiff / 1000);
        const days = Math.floor(totalSeconds / (60 * 60 * 24));
        const hours = Math.floor((totalSeconds % (60 * 60 * 24)) / (60 * 60));
        const minutes = Math.floor((totalSeconds % (60 * 60)) / 60);
        const seconds = totalSeconds % 60;
        setTimeLeft({ days, hours, minutes, seconds, isLive: false, isPast: false });
      }
    };

    if (!targetDate) {
      const timeout = window.setTimeout(() => setTimeLeft(null), 0);
      return () => window.clearTimeout(timeout);
    }

    const target = new Date(targetDate).getTime();
    const initialTimeout = window.setTimeout(() => updateTimeLeft(target), 0);

    const interval = setInterval(() => {
      updateTimeLeft(target);
    }, 1000);

    return () => {
      window.clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, [targetDate]);

  return timeLeft;
}
