import fetch from "node-fetch";
import fs from "fs";
import { execSync } from "child_process";
import "dotenv/config";

const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const GUILD_ID = process.env.GUILD_ID;

const MAIN_FILE = "./static/data/discord-events.json";
const GH_PAGES_FILE = "./data/discord-events.json";
const GH_PAGES_BRANCH = "gh-pages";

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
  return events.map(e => ({
    id: e.id,
    name: e.name,
    description: e.description,
    startTime: e.scheduled_start_time,
    endTime: e.scheduled_end_time,
    status: e.status
  }));
}

function loadJSON(filePath) {
  if (!fs.existsSync(filePath)) return [];
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf-8"));
  } catch {
    return [];
  }
}

async function main() {
  const newEvents = await fetchDiscordEvents();
  const newJSON = JSON.stringify(newEvents, null, 2);

  // -------------------------
  // 1️⃣ Update main branch
  // -------------------------
  const oldMainJSON = fs.existsSync(MAIN_FILE) ? fs.readFileSync(MAIN_FILE, "utf-8") : "";
  if (newJSON !== oldMainJSON) {
    fs.writeFileSync(MAIN_FILE, newJSON);
    try {
      execSync(`git add ${MAIN_FILE}`);
      execSync('git commit -m "Update Discord events on main"');
      execSync('git push origin main');
      console.log("Main branch updated.");
    } catch {
      console.log("No changes to push on main.");
    }
  } else {
    console.log("No changes detected for main branch.");
  }

  // -------------------------
  // 2️⃣ Update gh-pages branch
  // -------------------------
  try {
    execSync(`git fetch origin ${GH_PAGES_BRANCH}`);
    execSync(`git checkout ${GH_PAGES_BRANCH}`);
    fs.mkdirSync("./data", { recursive: true }); // ensure folder exists
    fs.writeFileSync(GH_PAGES_FILE, newJSON);

    const oldGHPagesJSON = loadJSON(GH_PAGES_FILE);
    if (JSON.stringify(oldGHPagesJSON, null, 2) !== newJSON) {
      execSync(`git add ${GH_PAGES_FILE}`);
      execSync('git commit -m "Update Discord events on gh-pages"');
      execSync(`git push origin ${GH_PAGES_BRANCH}`);
      console.log("gh-pages branch updated.");
    } else {
      console.log("No changes detected for gh-pages branch.");
    }

    execSync('git checkout main'); // switch back
  } catch (err) {
    console.error("Error updating gh-pages branch:", err.message);
    execSync('git checkout main');
  }
}

main();