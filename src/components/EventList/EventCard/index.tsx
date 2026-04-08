import React, { CSSProperties } from "react";
import type { Event } from "../../../helpers/eventUtils";
import {
  formatDate,
  getGoogleCalendarUrl,
  generateICS,
} from "../../../helpers/eventUtils";
import { useCountdown } from "../../../helpers/useCountdown";
import useBaseUrl from "@docusaurus/useBaseUrl";
import Link from "@docusaurus/Link";
import styles from "./styles.module.css";

export default function EventCard({
  event,
  isNext = false,
  style,
  compact = false,
}: {
  event: Event & { recapUrl?: string | null };
  isNext?: boolean;
  style?: CSSProperties;
  compact?: boolean;
}) {
  const start = new Date(event.startTime);
  const end = event.endTime ? new Date(event.endTime) : null;

  // NEW: SSR‑safe countdown hook
  const countdown = useCountdown(start, end, event.status);

  const cardClasses = [
    styles.card,
    isNext ? styles.nextEvent : "",
    countdown?.isPast ? styles.pastEvent : "",
    countdown?.isLive ? styles.liveEvent : "",
  ].join(" ");

  return (
    <div className={cardClasses} style={style}>
      <h2 className="text--primary margin-vert--sm">{event.name}</h2>

      <div className="margin-vert--sm">
        {formatDate(start)} {end ? `– ${formatDate(end)}` : ""}
      </div>

      {/* Status / countdown */}
      {countdown && (
        <div
          className={`${styles.countdown} ${
            countdown.isCanceled
              ? styles.canceled
              : countdown.isLive
              ? styles.live
              : styles.upcoming
          }`}
        >
          {countdown.isCanceled
            ? "Canceled"
            : countdown.isLive
            ? "Live now!"
            : countdown.timeParts
            ? `Starts in ${countdown.timeParts.days}d ${countdown.timeParts.hours}h ${countdown.timeParts.minutes}m ${countdown.timeParts.seconds}s`
            : ""}
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

          {countdown?.isPast && event.recapUrl && (
            <Link to={useBaseUrl(event.recapUrl)}>Read Recap</Link>
          )}

          {!countdown?.isPast && !countdown?.isCanceled && (
            <>
              <Link
                href={getGoogleCalendarUrl(event)}
                target="_blank"
                rel="noopener noreferrer"
              >
                Add to Google Calendar
              </Link>
              <Link href={generateICS(event)} download={`${event.name}.ics`}>
                Download .ICS
              </Link>
            </>
          )}

          {countdown?.isPast &&
            !countdown.isCanceled &&
            !event.recapUrl && (
              <span style={{ fontSize: "0.8rem", opacity: 0.7 }}>
                Recap coming soon...
              </span>
            )}
        </div>
      )}
    </div>
  );
}
