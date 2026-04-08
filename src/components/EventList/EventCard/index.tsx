import React, { CSSProperties } from "react";
import type { Event } from "../../../helpers/eventUtils";
import { formatDate, getTimeParts, getGoogleCalendarUrl, generateICS } from "../../../helpers/eventUtils";
import useBaseUrl from "@docusaurus/useBaseUrl";
import Link from "@docusaurus/Link";
import styles from './styles.module.css';

export default function EventCard({
  event,
  isNext = false,
  now,
  style,
  compact = false,
}: {
  event: Event & { recapUrl?: string | null };
  isNext?: boolean;
  now: number;
  style?: CSSProperties;
  compact?: boolean;
}) {
  const start = new Date(event.startTime);
  const end = event.endTime ? new Date(event.endTime) : null;
  const endTime = end ?? new Date(start.getTime() + 60 * 60 * 1000); // fallback 1h

  // Determine status
  const isCanceled = event.status === 4;
  const isCompleted = event.status === 3;
  const isLive = event.status === 2 && !isCanceled;
  const isPast = isCompleted || isCanceled || (!isLive && now > endTime.getTime());
  const isUpcoming = !isPast && !isLive;

  // Countdown (to start if upcoming, to end if live)
  const timeLeft = isUpcoming ? start.getTime() - now : isLive ? endTime.getTime() - now : null;
  const timeParts = timeLeft ? getTimeParts(timeLeft) : null;

  // Card CSS classes
  const cardClasses = [
    styles.card,
    isNext ? styles.nextEvent : '',
    isPast ? styles.pastEvent : '',
    isLive ? styles.liveEvent : '',
  ].join(' ');

  return (
    <div className={cardClasses} style={style}>
      <h2 className="text--primary margin-vert--sm">{event.name}</h2>

      <div className="margin-vert--sm">
        {formatDate(start)} {end ? `– ${formatDate(end)}` : ""}
      </div>

      {/* Status / countdown */}
      {(timeParts || isCanceled) && (
        <div
          className={`${styles.countdown} ${isCanceled ? styles.canceled : isLive ? styles.live : styles.upcoming
            }`}
        >
          {isCanceled
            ? "Canceled"
            : isLive
              ? "Live now!"
              : `Starts in ${timeParts!.days}d ${timeParts!.hours}h ${timeParts!.minutes}m ${timeParts!.seconds}s`}
        </div>
      )}

      {/* Only show description if not compact */}
      {!compact && event.description && <p>{event.description}</p>}

      {/* Only show links if not compact */}
      {!compact && (
        <div className={styles.links}>
          {event.url && (
            <Link href={event.url} target="_blank" rel="noopener noreferrer">
              More info
            </Link>
          )}
          {isPast && event.recapUrl && (
            <Link to={useBaseUrl(event.recapUrl)}>Read Recap</Link>
          )}
          {!isPast && !isCanceled && (
            <>
              <Link href={getGoogleCalendarUrl(event)} target="_blank" rel="noopener noreferrer">
                Add to Google Calendar
              </Link>
              <Link href={generateICS(event)} download={`${event.name}.ics`}>
                Download .ICS
              </Link>
            </>
          )}
          {isPast && !isCanceled && !event.recapUrl && <span style={{ fontSize: "0.8rem", opacity: 0.7 }}>Recap coming soon...</span>}
        </div>
      )}
    </div>
  );
}