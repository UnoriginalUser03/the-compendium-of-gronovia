import fetch from "node-fetch";
import fs from "fs";
import { execSync } from "child_process";
import "dotenv/config";

const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const GUILD_ID = process.env.GUILD_ID;
const OUTPUT_FILE = "./src/data/discord-events.json";
const TARGET_BRANCH = "gh-pages";

if (!DISCORD_TOKEN || !GUILD_ID) {
  console.error("Missing DISCORD_TOKEN or GUILD_ID in .env");
  process.exit(1);
}

async function fetchDiscordEvents() {
  const res = await fetch(
    `https://discord.com/api/v10/guilds/${GUILD_ID}/scheduled-events`,
    { headers: { Authorization: `Bot ${DISCORD_TOKEN}` } }
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

async function main() {
  const newEvents = await fetchDiscordEvents();
  let oldEvents = [];

  if (fs.existsSync(OUTPUT_FILE)) {
    try { oldEvents = JSON.parse(fs.readFileSync(OUTPUT_FILE, "utf-8")); } catch {}
  }

  // Merge by ID
  const map = new Map();
  for (const e of oldEvents) map.set(e.id, e);
  for (const e of newEvents) map.set(e.id, e);
  const merged = Array.from(map.values());
  const newJSON = JSON.stringify(merged, null, 2);
  const oldJSON = fs.existsSync(OUTPUT_FILE) ? fs.readFileSync(OUTPUT_FILE, "utf-8") : "";

  if (newJSON === oldJSON) {
    console.log("No changes detected, skipping commit.");
    return;
  }

  // Update main branch
  fs.writeFileSync(OUTPUT_FILE, newJSON);
  try {
    execSync(`git add ${OUTPUT_FILE}`);
    execSync('git commit -m "Update Discord events on main"');
    execSync('git push origin main');
    console.log("Main branch updated.");
  } catch {
    console.log("No changes to push on main.");
  }

  // Update gh-pages branch
  try {
    execSync(`git fetch origin ${TARGET_BRANCH}`);
    execSync(`git checkout ${TARGET_BRANCH}`);
    fs.writeFileSync(OUTPUT_FILE, newJSON); // overwrite
    execSync(`git add ${OUTPUT_FILE}`);
    execSync('git commit -m "Update Discord events on gh-pages"');
    execSync(`git push origin ${TARGET_BRANCH}`);
    console.log("gh-pages branch updated.");
    execSync('git checkout main'); // go back to main
  } catch {
    console.log("No changes to push on gh-pages.");
    execSync('git checkout main');
  }
}

main();