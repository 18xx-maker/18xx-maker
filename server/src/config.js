const REQUIRED = [
  "DATABASE_URL",
  "PUBLIC_URL",
  "DISCORD_CLIENT_ID",
  "DISCORD_CLIENT_SECRET",
];

const int = (value, fallback) => {
  if (value === undefined || value === "") return fallback;
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
};

export const loadConfig = (env) => {
  const missing = REQUIRED.filter((name) => !env[name]);
  if (missing.length) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}`,
    );
  }

  return {
    port: int(env.PORT, 8787),
    databaseUrl: env.DATABASE_URL,
    publicUrl: env.PUBLIC_URL,
    allowedOrigins: (env.ALLOWED_ORIGINS || "")
      .split(",")
      .map((o) => o.trim())
      .filter(Boolean),
    discord: {
      clientId: env.DISCORD_CLIENT_ID,
      clientSecret: env.DISCORD_CLIENT_SECRET,
      guildId: env.DISCORD_GUILD_ID || "",
      apiBase: env.DISCORD_API_BASE || "https://discord.com/api",
      authBase: env.DISCORD_AUTH_BASE || "https://discord.com/oauth2",
    },
    limits: {
      gameBytes: int(env.MAX_GAME_BYTES, 2097152),
      assetBytes: int(env.MAX_ASSET_BYTES, 1048576),
      gamesPerUser: int(env.MAX_GAMES_PER_USER, 50),
      eventsPerSecond: int(env.MAX_EVENTS_PER_SECOND, 10),
      snapshotEvery: int(env.SNAPSHOT_EVERY, 100),
      joinTimeoutMs: int(env.JOIN_TIMEOUT_MS, 10000),
    },
  };
};
