// The play server for e2e/play.spec.js: the real server on port 4319 with a
// fresh schema and the fake Discord (users Alice and Bob, both in the guild).
// Started by playwright.config.js only when DATABASE_URL is set.
if (!process.env.DATABASE_URL) {
  console.error("play-server: DATABASE_URL must be set");
  process.exit(1);
}

const { createServer } = await import("../../server/src/app.js");
const { loadConfig } = await import("../../server/src/config.js");
const { makeTestDb } = await import("../../server/test/db.js");
const { startFakeDiscord } = await import("../../server/test/discord.js");

const PORT = 4319;
const GUILD = "guild-e2e";

const db = await makeTestDb();
const discord = await startFakeDiscord({
  users: [
    { code: "alice", id: "101", username: "Alice", guilds: [GUILD] },
    { code: "bob", id: "102", username: "Bob", guilds: [GUILD] },
  ],
});
const config = loadConfig({
  DATABASE_URL: process.env.DATABASE_URL,
  PORT: String(PORT),
  PUBLIC_URL: `http://localhost:${PORT}`,
  ALLOWED_ORIGINS: "http://localhost:4318",
  DISCORD_CLIENT_ID: "e2e",
  DISCORD_CLIENT_SECRET: "e2e-secret",
  DISCORD_GUILD_ID: GUILD,
  DISCORD_API_BASE: discord.url,
  DISCORD_AUTH_BASE: discord.url,
});
const server = createServer({ pool: db.pool, config });
await new Promise((resolve) => server.listen(PORT, resolve));
console.log(`play server ready on http://localhost:${PORT}`);

let stopping = false;
const stop = async () => {
  if (stopping) return;
  stopping = true;
  setTimeout(() => process.exit(1), 5000).unref();
  await new Promise((resolve) => {
    server.close(resolve);
    server.closeAllConnections?.();
  });
  await discord.close();
  await db.close();
  process.exit(0);
};
process.on("SIGTERM", stop);
process.on("SIGINT", stop);
