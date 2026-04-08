export interface NamedLink {
  name: string;
  url?: string;
}

export interface Handout {
  title: string;
  id: string;
  url: string;
  campaign: string;
  description?: string;
  session?: NamedLink;
  foundBy?: NamedLink[];
  location?: NamedLink[];
  tags?: string[];
}

export type Handouts = Handout[];

export const handouts: Handouts = [
  {
    title: "Cecilia's Note #1",
    id: "session1-note1",
    campaign: "Ruarden Hold",
    url: "img/handouts/session1-note1.png",
    description: "A note about moving from Venmeer to Ruarden Hold written by a dwarf.",
    session: {
      name: "Session 1: Ruarden Hold",
      url: "/sessions/session1"
    },
    foundBy: [{ name: "Merla" }, { name: "Cordelia" }],
    location: [{ name: "Ruarden Hold" }, { name: "Balguard" }],
    tags: ["campaign/ruarden-hold", "faction/stonebloods"]
  },
  {
    title: "Shipment Note",
    id: "session1-note2",
    campaign: "Ruarden Hold",
    url: "img/handouts/session1-note2.png",
    description: "A note about a 'special shipment' in the warehouse.",
    session: {
      name: "Session 1: Ruarden Hold",
      url: "/sessions/session1"
    },
    foundBy: [{ name: "Merla" }, { name: "Cordelia" }],
    location: [{ name: "Ruarden Hold" }, { name: "Balguard" }],
    tags: ["campaign/ruarden-hold", "faction/stonebloods"]
  },
  {
    title: "Cecilia's Note #2",
    id: "session1-note3",
    campaign: "Ruarden Hold",
    url: "img/handouts/session1-note3.png",
    description: "A note about Stubsy getting into trouble.",
    session: {
      name: "Session 1: Ruarden Hold",
      url: "/sessions/session1"
    },
    foundBy: [{ name: "Merla" }, { name: "Cordelia" }],
    location: [{ name: "Ruarden Hold" }, { name: "Balguard" }],
    tags: ["campaign/ruarden-hold", "faction/stonebloods"]
  },
  {
    title: "Dwarven Diary Entry #1",
    id: "session1-note4",
    campaign: "Ruarden Hold",
    url: "img/handouts/session1-note4.png",
    description: "A note about Henry being a wanted man.",
    session: {
      name: "Session 1: Ruarden Hold",
      url: "/sessions/session1"
    },
    foundBy: [{ name: "Merla" }, { name: "Cordelia" }],
    location: [{ name: "Ruarden Hold" }, { name: "Balguard" }],
    tags: ["campaign/ruarden-hold", "faction/stonebloods"]
  },
  {
    title: "Dwarven Diary Entry #2",
    id: "session1-note5",
    campaign: "Ruarden Hold",
    url: "img/handouts/session1-note5.png",
    description: "A note about Henry being a wanted man.",
    session: {
      name: "Session 1: Ruarden Hold",
      url: "/sessions/session1"
    },
    foundBy: [{ name: "Merla" }, { name: "Cordelia" }],
    location: [{ name: "Ruarden Hold" }, { name: "Balguard" }],
    tags: ["campaign/ruarden-hold", "faction/stonebloods"]
  },
];
