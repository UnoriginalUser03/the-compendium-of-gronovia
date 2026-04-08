import fetch from "node-fetch";
import fs from "fs";
import { execSync } from "child_process";

const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const GUILD_ID = process.env.GUILD_ID;

if (!DISCORD_TOKEN || !GUILD_ID) {
  console.error("Missing DISCORD_TOKEN or GUILD_ID");
  process.exit(1);
}

const MAIN_FILE = "./static/data/discord-events.json";
const GH_PAGES_FILE = "./data/discord-events.json";
const GH_PAGES_BRANCH = "gh-pages";

// fetch events from Discord
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

function loadJSON(path) {
  if (!fs.existsSync(path)) return [];
  try {
    return JSON.parse(fs.readFileSync(path, "utf-8"));
  } catch {
    return [];
  }
}

// write file only if changed
function writeIfChanged(path, data) {
  const oldData = fs.existsSync(path) ? fs.readFileSync(path, "utf-8") : "";
  if (oldData !== data) {
    fs.mkdirSync(path.split("/").slice(0, -1).join("/"), { recursive: true });
    fs.writeFileSync(path, data);
    return true;
  }
  return false;
}

async function main() {
  const events = await fetchDiscordEvents();
  const jsonData = JSON.stringify(events, null, 2);

  // -------------------------
  // 1️⃣ Update main branch
  // -------------------------
  if (writeIfChanged(MAIN_FILE, jsonData)) {
    console.log("Main file changed. Committing...");

    execSync('git config user.name "github-actions[bot]"');
    execSync('git config user.email "github-actions[bot]@users.noreply.github.com"');

    execSync(`git add ${MAIN_FILE}`);
    execSync('git commit -m "Update Discord events on main" || echo "No changes to commit"');
    execSync('git push origin main || echo "Nothing to push"');
    console.log("Main branch updated.");
  } else {
    console.log("No changes detected on main branch.");
  }

  // -------------------------
  // 2️⃣ Update gh-pages branch
  // -------------------------
  try {
    execSync(`git fetch origin ${GH_PAGES_BRANCH}`);
    execSync(`git checkout -B ${GH_PAGES_BRANCH} origin/${GH_PAGES_BRANCH}`);

    if (writeIfChanged(GH_PAGES_FILE, jsonData)) {
      console.log("GH Pages file changed. Committing...");

      execSync('git config user.name "github-actions[bot]"');
      execSync('git config user.email "github-actions[bot]@users.noreply.github.com"');

      execSync(`git add ${GH_PAGES_FILE}`);
      execSync('git commit -m "Update Discord events on gh-pages" || echo "No changes to commit"');
      execSync(`git push origin ${GH_PAGES_BRANCH} || echo "Nothing to push"`);
      console.log("GH Pages branch updated.");
    } else {
      console.log("No changes detected on gh-pages branch.");
    }

    execSync('git checkout main'); // switch back
  } catch (err) {
    console.error("Error updating gh-pages branch:", err.message);
    execSync('git checkout main');
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});