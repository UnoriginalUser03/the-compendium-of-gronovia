import fetch from "node-fetch";
import fs from "fs";

const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const GUILD_ID = process.env.GUILD_ID;

if (!DISCORD_TOKEN || !GUILD_ID) {
  console.error("Missing DISCORD_TOKEN or GUILD_ID");
  process.exit(1);
}

const OUTPUT_MAIN = "./static/data/discord-events.json";
const OUTPUT_PAGES = "./data/discord-events.json";

async function fetchDiscordEvents() {
  const res = await fetch(
    `https://discord.com/api/v10/guilds/${GUILD_ID}/scheduled-events`,
    { headers: { Authorization: `Bot ${DISCORD_TOKEN}` } }
  );

  if (!res.ok) {
    throw new Error(`Failed to fetch events: ${res.status} ${res.statusText}`);
  }

  const events = await res.json();

  return events.map(e => ({
    id: e.id,
    name: e.name,
    description: e.description,
    startTime: e.scheduled_start_time,
    endTime: e.scheduled_end_time,
    status: e.status
  }));
}

function writeJSON(path, data) {
  fs.mkdirSync(path.split("/").slice(0, -1).join("/"), { recursive: true });
  fs.writeFileSync(path, JSON.stringify(data, null, 2));
}

async function main() {
  const events = await fetchDiscordEvents();

  writeJSON(OUTPUT_MAIN, events);
  writeJSON(OUTPUT_PAGES, events);

  console.log("Discord events updated.");
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
