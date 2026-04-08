import React, { useEffect, useState } from "react";
import { Event, splitEvents } from "../../helpers/eventUtils";
import EventList from "../EventList";
import Link from "@docusaurus/Link";
import useBaseUrl from "@docusaurus/useBaseUrl";

export default function HomepageEvents() {
  const [events, setEvents] = useState<Event[] | null>(null);
  const url = useBaseUrl("/data/discord-events.json");

  useEffect(() => {
    fetch(url)
      .then(res => res.json())
      .then(setEvents)
      .catch(err => console.error("Failed to load events:", err));
  }, [url]);

  if (!events) return null;

  const { live, upcoming } = splitEvents(events);

  // Combine live + upcoming to get up to 3 cards
  const nextEvents = [...live, ...upcoming].slice(0, 3);

  if (!nextEvents.length) return null;

  return (
    <section className="container margin-vert--lg">
      <EventList
        title="Next Sessions"
        events={nextEvents}
        highlightNext={true}
        compact={true}
      />
      <div className="text--center" style={{ marginTop: 16 }}>
        <Link to="events" className="button button--secondary">
          View All Events
        </Link>
      </div>
    </section>
  );
}
