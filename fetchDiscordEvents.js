import fetch from "node-fetch";
import fs from "fs";
import { execSync } from "child_process";
import "dotenv/config";

const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const GUILD_ID = process.env.GUILD_ID;
const OUTPUT_FILE = "./src/data/discord-events.json";
const TARGET_BRANCH = "gh-pages"; // branch to push updated data to

if (!DISCORD_TOKEN || !GUILD_ID) {
  console.error("Missing DISCORD_TOKEN or GUILD_ID in .env");
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

async function main() {
  const newEvents = await fetchDiscordEvents();
  let oldEvents = [];

  if (fs.existsSync(OUTPUT_FILE)) {
    try {
      oldEvents = JSON.parse(fs.readFileSync(OUTPUT_FILE, "utf-8"));
    } catch {}
  }

  // Merge old + new events by ID
  const map = new Map();
  for (const e of oldEvents) map.set(e.id, e);
  for (const e of newEvents) map.set(e.id, e);
  const merged = Array.from(map.values());

  const newJSON = JSON.stringify(merged, null, 2);

  // Only write + commit if different
  const oldJSON = fs.existsSync(OUTPUT_FILE)
    ? fs.readFileSync(OUTPUT_FILE, "utf-8")
    : "";
  if (newJSON === oldJSON) {
    console.log("No changes, skipping commit.");
    return;
  }

  fs.writeFileSync(OUTPUT_FILE, newJSON);
  console.log(`Saved ${merged.length} total events`);

  try {
    // Checkout the target branch temporarily
    execSync(`git fetch origin ${TARGET_BRANCH}`);
    execSync(`git checkout ${TARGET_BRANCH}`);
    fs.writeFileSync(OUTPUT_FILE, newJSON); // overwrite in gh-pages branch
    execSync(`git add ${OUTPUT_FILE}`);
    execSync(`git commit -m "Update Discord events"`);
    execSync(`git push origin ${TARGET_BRANCH}`);
    console.log("Updated gh-pages branch with new events.");
    execSync(`git checkout -`); // go back to main
  } catch (err) {
    console.error("Failed to push to gh-pages:", err);
  }
}

main();