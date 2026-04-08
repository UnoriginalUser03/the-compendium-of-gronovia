import React, { CSSProperties, useEffect, useState } from "react";
import EventCard from "./EventCard";
import type { Event } from "../../helpers/eventUtils";
import styles from './styles.module.css';

export default function EventList({
    title,
    events,
    cardStyle,
    highlightNext = true,
    compact = false,
}: {
    title: string;
    events: Event[];
    cardStyle?: CSSProperties;
    highlightNext?: boolean;
    compact?: boolean;
}) {
    if (!events.length) return null;

    const [now, setNow] = useState(Date.now());

    useEffect(() => {
        const timer = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(timer);
    }, []);

    const nextEventId = highlightNext
        ? events.find(e => new Date(e.startTime).getTime() > now)?.id
        : null;

    return (
        <div className={styles.container}>
            <h1 className="text--center">{title}</h1>
            <div>
                {events.map(event => (
                    <EventCard
                        key={event.id}
                        event={event}
                        isNext={event.id === nextEventId}
                        now={now}
                        style={cardStyle}
                        compact={compact}
                    />
                ))}
            </div>

        </div>
    );
}