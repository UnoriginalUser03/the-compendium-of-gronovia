import React, { useEffect, useState } from "react";
import EventList from "../../components/EventList";
import type { Event } from "../../helpers/eventUtils";
import { splitEvents } from "../../helpers/eventUtils";
import eventRecapsRaw from "../../data/event-recaps.json";
import Layout from "@theme/Layout";
import useBaseUrl from "@docusaurus/useBaseUrl";

export default function Events() {
    const [events, setEvents] = useState<Event[] | null>(null);
    const url = useBaseUrl("/data/discord-events.json");

    useEffect(() => {
        fetch(url)
            .then(res => res.json())
            .then(setEvents)
            .catch(err => console.error("Failed to load events:", err));
    }, [url]);

    if (!events) {
        return (
            <Layout>
                <p style={{ padding: "2rem" }}>Loading events…</p>
            </Layout>
        );
    }

    const eventRecaps: Record<string, string> = eventRecapsRaw;
    const { live, upcoming, past } = splitEvents(events);

    const pastWithRecap = past.map(e => ({
        ...e,
        recapUrl: eventRecaps[e.id] || null,
    }));

    return (
        <Layout>
            <EventList title="Live Now" events={live} highlightNext={false} />
            <EventList title="Upcoming Events" events={upcoming} highlightNext />
            <EventList
                title="Past Events"
                events={pastWithRecap}
                highlightNext={false}
            />
        </Layout>
    );
}
