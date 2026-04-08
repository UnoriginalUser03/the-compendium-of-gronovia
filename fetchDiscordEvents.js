import fetch from "node-fetch";
import fs from "fs";
import crypto from "crypto";

const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const GUILD_ID = process.env.GUILD_ID;

if (!DISCORD_TOKEN || !GUILD_ID) {
  console.error("Missing DISCORD_TOKEN or GUILD_ID");
  process.exit(1);
}

const OUTPUT_MAIN = "./static/data/discord-events.json";
const OUTPUT_PAGES = "./data/discord-events.json";

/* -------------------------------------------------------
   Utility: Write JSON only if content changed
------------------------------------------------------- */
function writeIfChanged(path, data) {
  const json = JSON.stringify(data, null, 2);
  const newHash = crypto.createHash("sha256").update(json).digest("hex");

  let oldHash = null;
  if (fs.existsSync(path)) {
    const old = fs.readFileSync(path, "utf8");
    oldHash = crypto.createHash("sha256").update(old).digest("hex");
  }

  if (newHash !== oldHash) {
    fs.mkdirSync(path.split("/").slice(0, -1).join("/"), { recursive: true });
    fs.writeFileSync(path, json);
    return true;
  }

  return false;
}

/* -------------------------------------------------------
   Utility: Fetch with retry + rate limit handling
------------------------------------------------------- */
async function fetchWithRetry(url, options, retries = 3) {
  for (let i = 0; i < retries; i++) {
    const res = await fetch(url, options);

    // Rate limited
    if (res.status === 429) {
      const retryAfter = Number(res.headers.get("Retry-After") || 1);
      console.warn(`Rate limited. Retrying in ${retryAfter}s...`);
      await new Promise(r => setTimeout(r, retryAfter * 1000));
      continue;
    }

    // Success
    if (res.ok) return res;

    // Retry on 5xx
    if (res.status >= 500) {
      console.warn(`Server error ${res.status}. Retrying...`);
      await new Promise(r => setTimeout(r, 1000));
      continue;
    }

    // Other errors → fail immediately
    throw new Error(`HTTP ${res.status}: ${res.statusText}`);
  }

  throw new Error("Failed after multiple retries");
}

/* -------------------------------------------------------
   Fetch Discord events
------------------------------------------------------- */
async function fetchDiscordEvents() {
  const url = `https://discord.com/api/v10/guilds/${GUILD_ID}/scheduled-events`;

  const res = await fetchWithRetry(url, {
    headers: { Authorization: `Bot ${DISCORD_TOKEN}` },
  });

  const events = await res.json();

  // Normalize + sort for stable output
  return events
    .map(e => ({
      id: e.id,
      name: e.name,
      description: e.description,
      startTime: e.scheduled_start_time,
      endTime: e.scheduled_end_time,
      status: e.status,
    }))
    .sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
}

/* -------------------------------------------------------
   Main
------------------------------------------------------- */
async function main() {
  console.log("Fetching Discord events…");

  const events = await fetchDiscordEvents();

  const changedMain = writeIfChanged(OUTPUT_MAIN, events);
  const changedPages = writeIfChanged(OUTPUT_PAGES, events);

  if (changedMain || changedPages) {
    console.log("Discord events updated.");
  } else {
    console.log("No changes detected.");
  }
}

main().catch(err => {
  console.error("Error:", err);
  process.exit(1);
});
