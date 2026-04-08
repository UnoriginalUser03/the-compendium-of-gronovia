import React from "react";
import EventList from "../../components/EventList";
import type { Event } from "../../helpers/eventUtils";
import { splitEvents } from "../../helpers/eventUtils";
import eventsData from "../../../static/data/discord-events.json";
import eventRecapsRaw from "../../data/event-recaps.json";
import Layout from "@theme/Layout";

export default function Events() {
  const eventRecaps: Record<string, string> = eventRecapsRaw;
  const { live, upcoming, past } = splitEvents(eventsData as Event[]);

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