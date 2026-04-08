export type Event = {
  id: string;
  name: string;
  description: string | null;
  startTime: string;
  endTime: string | null;
  status: number;
  url: string | null;
};

// Split events into live, upcoming, and past
export function splitEvents(events: Event[], defaultDurationMs = 60 * 60 * 1000) {
  const now = Date.now();

  const upcoming: Event[] = [];
  const live: Event[] = [];
  const past: Event[] = [];

  events.forEach(e => {
    const start = new Date(e.startTime).getTime();
    const end = e.endTime ? new Date(e.endTime).getTime() : start + defaultDurationMs;

    // Discord status overrides
    if (e.status === 3 || e.status === 4) {
      // Completed or canceled → past
      past.push(e);
    } else if (e.status === 2) {
      // Active → live
      live.push(e);
    } else if (e.status === 1) {
      // Scheduled → check timestamps
      if (now < start) {
        upcoming.push(e);
      } else if (now >= start && now <= end) {
        live.push(e);
      } else {
        past.push(e);
      }
    } else {
      // fallback if status missing
      if (now < start) {
        upcoming.push(e);
      } else if (now >= start && now <= end) {
        live.push(e);
      } else {
        past.push(e);
      }
    }
  });

  // Sort lists
  upcoming.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
  live.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
  past.sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());

  return { upcoming, live, past };
}

// Format a date
export function formatDate(date: Date) {
  return date.toLocaleDateString("en-AU") + " " +
    date.toLocaleTimeString("en-AU", { hour: "numeric", minute: "2-digit", hour12: true });
}

// Convert diff in ms to days/hours/minutes/seconds
export function getTimeParts(diff: number) {
  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / (60 * 60 * 24));
  const hours = Math.floor((totalSeconds / (60 * 60)) % 24);
  const minutes = Math.floor((totalSeconds / 60) % 60);
  const seconds = totalSeconds % 60;
  return { days, hours, minutes, seconds };
}

// Calendar helpers
export function formatICalDate(date: string) {
  const d = new Date(date);
  return d.toISOString().replace(/-|:|\.\d+/g, '');
}

export function getGoogleCalendarUrl(event: { name: string; description?: string | null; startTime: string; endTime?: string | null }) {
  const start = formatICalDate(event.startTime);
  const end = formatICalDate(event.endTime || event.startTime);
  const url = new URL('https://calendar.google.com/calendar/render');
  url.searchParams.set('action', 'TEMPLATE');
  url.searchParams.set('text', event.name);
  url.searchParams.set('dates', `${start}/${end}`);
  url.searchParams.set('details', event.description || '');
  return url.toString();
}

export function generateICS(event: { name: string; description?: string | null; startTime: string; endTime?: string | null }) {
  const start = formatICalDate(event.startTime);
  const end = formatICalDate(event.endTime || event.startTime);
  const ics = `
BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
SUMMARY:${event.name}
DESCRIPTION:${event.description || ''}
DTSTART:${start}
DTEND:${end}
END:VEVENT
END:VCALENDAR
  `.trim();
  return URL.createObjectURL(new Blob([ics], { type: 'text/calendar;charset=utf-8' }));
}
