const REQUIRED = [
  "DATABASE_URL",
  "PUBLIC_URL",
  "DISCORD_CLIENT_ID",
  "DISCORD_CLIENT_SECRET",
];

const int = (name, value, fallback) => {
  if (value === undefined || value === "") return fallback;
  const n = Number(value);
  if (!Number.isSafeInteger(n) || n < 1) {
    throw new Error(`${name} must be a positive integer, got "${value}"`);
  }
  return n;
};

export const loadConfig = (env) => {
  const missing = REQUIRED.filter((name) => !env[name]);
  if (missing.length) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}`,
    );
  }

  return {
    port: int("PORT", env.PORT, 8787),
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
      timeoutMs: int("DISCORD_TIMEOUT_MS", env.DISCORD_TIMEOUT_MS, 10000),
    },
    limits: {
      gameBytes: int("MAX_GAME_BYTES", env.MAX_GAME_BYTES, 2097152),
      assetBytes: int("MAX_ASSET_BYTES", env.MAX_ASSET_BYTES, 1048576),
      assetsPerGame: int("MAX_ASSETS_PER_GAME", env.MAX_ASSETS_PER_GAME, 50),
      assetTotalBytes: int(
        "MAX_ASSET_TOTAL_BYTES",
        env.MAX_ASSET_TOTAL_BYTES,
        8388608,
      ),
      gamesPerUser: int("MAX_GAMES_PER_USER", env.MAX_GAMES_PER_USER, 50),
      eventsPerSecond: int(
        "MAX_EVENTS_PER_SECOND",
        env.MAX_EVENTS_PER_SECOND,
        10,
      ),
      eventsPerGame: int(
        "MAX_EVENTS_PER_GAME",
        env.MAX_EVENTS_PER_GAME,
        200000,
      ),
      snapshotEvery: int("SNAPSHOT_EVERY", env.SNAPSHOT_EVERY, 100),
      joinTimeoutMs: int("JOIN_TIMEOUT_MS", env.JOIN_TIMEOUT_MS, 10000),
      sessionTtlDays: int("SESSION_TTL_DAYS", env.SESSION_TTL_DAYS, 30),
    },
  };
};
