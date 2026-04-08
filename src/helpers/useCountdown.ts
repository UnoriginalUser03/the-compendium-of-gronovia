import { useEffect, useState } from "react";
import { getTimeParts } from "./eventUtils";

export function useCountdown(start: Date, end: Date | null, status: number) {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    const update = () => setNow(Date.now());
    update(); // run immediately on mount
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  if (now === null) return null;

  const isCanceled = status === 4;
  const isCompleted = status === 3;
  const isLive = status === 2 && !isCanceled;

  const endTime = end ?? new Date(start.getTime() + 3600000);
  const isPast =
    isCompleted ||
    isCanceled ||
    (!isLive && now > endTime.getTime());

  const isUpcoming = !isPast && !isLive;

  const timeLeft = isUpcoming
    ? start.getTime() - now
    : isLive
    ? endTime.getTime() - now
    : null;

  const timeParts = timeLeft ? getTimeParts(timeLeft) : null;

  return { isCanceled, isLive, isPast, isUpcoming, timeParts };
}
