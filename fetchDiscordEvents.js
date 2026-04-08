import fs from "fs";
import { execSync } from "child_process";

const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const GUILD_ID = process.env.GUILD_ID;
const OUTPUT_FILE = "./src/data/discord-events.json";

if (!DISCORD_TOKEN || !GUILD_ID) {
  console.error("Missing DISCORD_TOKEN or GUILD_ID in environment variables!");
  process.exit(1);
}

async function fetchDiscordEvents() {
  const res = await fetch(
    `https://discord.com/api/v10/guilds/${GUILD_ID}/scheduled-events`,
    {
      headers: { Authorization: `Bot ${DISCORD_TOKEN}` },
    }
  );

  if (!res.ok) {
    console.error("Failed to fetch events:", res.statusText);
    process.exit(1);
  }

  const events = await res.json();

  return events.map((e) => ({
    id: e.id,
    name: e.name,
    description: e.description,
    startTime: e.scheduled_start_time,
    endTime: e.scheduled_end_time,
    status: e.status,
  }));
}

function loadExistingEvents() {
  if (!fs.existsSync(OUTPUT_FILE)) return [];
  try {
    return JSON.parse(fs.readFileSync(OUTPUT_FILE, "utf-8"));
  } catch {
    return [];
  }
}

function mergeEvents(oldEvents, newEvents) {
  const map = new Map();

  oldEvents.forEach((e) => map.set(e.id, e));
  newEvents.forEach((e) => map.set(e.id, e));

  return Array.from(map.values());
}

async function main() {
  const newEvents = await fetchDiscordEvents();
  const existingEvents = loadExistingEvents();
  const merged = mergeEvents(existingEvents, newEvents);

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(merged, null, 2));
  console.log(`Saved ${merged.length} total events`);

  try {
    // Configure Git
    execSync('git config user.name "github-actions[bot]"');
    execSync('git config user.email "github-actions[bot]@users.noreply.github.com"');

    execSync(`git add ${OUTPUT_FILE}`);
    execSync('git commit -m "Update Discord events"');
    execSync("git push");
    console.log("Changes committed and pushed to GitHub.");
  } catch {
    console.log("No changes to commit.");
  }
}

main();