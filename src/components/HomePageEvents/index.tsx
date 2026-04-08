import React from "react";
import { Event, splitEvents } from "../../helpers/eventUtils";
import eventsData from "../../../static/data/discord-events.json";
import EventList from "../EventList";
import Link from "@docusaurus/Link";

export default function HomepageEvents() {
  const { live, upcoming } = splitEvents(eventsData as Event[]);

  // Combine live events + upcoming events to get up to 3 cards
  const nextEvents = [...live, ...upcoming].slice(0, 3);

  if (!nextEvents.length) return null;

  return (
    <section className="container margin-vert--lg">
      <EventList title="Next Sessions" events={nextEvents} highlightNext={true} compact={true} />
      <div className="text--center" style={{ marginTop: 16 }}>
        <Link to='events' className="button button--secondary">
          View All Events
        </Link>
      </div>
    </section>
  );
}