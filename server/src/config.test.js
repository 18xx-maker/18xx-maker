import { loadConfig } from "./config.js";

const required = {
  DATABASE_URL: "postgres://x",
  PUBLIC_URL: "https://play.example.com",
  DISCORD_CLIENT_ID: "id",
  DISCORD_CLIENT_SECRET: "secret",
};

describe("loadConfig", () => {
  it("applies defaults", () => {
    expect(loadConfig(required)).toEqual({
      port: 8787,
      databaseUrl: "postgres://x",
      publicUrl: "https://play.example.com",
      allowedOrigins: [],
      discord: {
        clientId: "id",
        clientSecret: "secret",
        guildId: "",
        apiBase: "https://discord.com/api",
        authBase: "https://discord.com/oauth2",
        timeoutMs: 10000,
        webhookOrigin: "https://discord.com",
      },
      limits: {
        gameBytes: 2097152,
        assetBytes: 1048576,
        assetsPerGame: 50,
        assetTotalBytes: 8388608,
        gamesPerUser: 50,
        eventsPerSecond: 10,
        eventsPerGame: 200000,
        snapshotEvery: 100,
        joinTimeoutMs: 10000,
        sessionTtlDays: 30,
        webhookBatchMs: 5000,
        webhookMaxPerMinute: 10,
        spectatorsPerGame: 50,
      },
    });
  });

  it("lists every missing required variable in the error", () => {
    expect(() => loadConfig({})).toThrow(
      /DATABASE_URL.*PUBLIC_URL.*DISCORD_CLIENT_ID.*DISCORD_CLIENT_SECRET/s,
    );
    expect(() => loadConfig({ ...required, PUBLIC_URL: "" })).toThrow(
      /PUBLIC_URL/,
    );
  });

  it("parses ALLOWED_ORIGINS and numeric limits", () => {
    const config = loadConfig({
      ...required,
      PORT: "9000",
      ALLOWED_ORIGINS: "https://a.com, https://b.com,,",
      MAX_GAME_BYTES: "10",
      MAX_ASSET_BYTES: "20",
      MAX_GAMES_PER_USER: "3",
      MAX_EVENTS_PER_SECOND: "4",
      SNAPSHOT_EVERY: "5",
      JOIN_TIMEOUT_MS: "50",
      SESSION_TTL_DAYS: "7",
      DISCORD_TIMEOUT_MS: "60",
      MAX_ASSETS_PER_GAME: "8",
      MAX_ASSET_TOTAL_BYTES: "90",
      MAX_EVENTS_PER_GAME: "70",
      WEBHOOK_BATCH_MS: "250",
      WEBHOOK_MAX_PER_MINUTE: "3",
      MAX_SPECTATORS: "6",
    });
    expect(config.port).toBe(9000);
    expect(config.allowedOrigins).toEqual(["https://a.com", "https://b.com"]);
    expect(config.discord.timeoutMs).toBe(60);
    expect(config.limits).toEqual({
      gameBytes: 10,
      assetBytes: 20,
      assetsPerGame: 8,
      assetTotalBytes: 90,
      gamesPerUser: 3,
      eventsPerSecond: 4,
      eventsPerGame: 70,
      snapshotEvery: 5,
      joinTimeoutMs: 50,
      sessionTtlDays: 7,
      webhookBatchMs: 250,
      webhookMaxPerMinute: 3,
      spectatorsPerGame: 6,
    });
  });

  it.each([
    ["PORT", "0"],
    ["PORT", "-1"],
    ["MAX_GAME_BYTES", "1.5"],
    ["MAX_ASSET_BYTES", "abc"],
    ["MAX_GAMES_PER_USER", "-5"],
    ["MAX_EVENTS_PER_SECOND", "0"],
    ["SNAPSHOT_EVERY", "0"],
    ["SNAPSHOT_EVERY", "0.5"],
    ["JOIN_TIMEOUT_MS", "0"],
    ["JOIN_TIMEOUT_MS", "1e400"],
    ["SESSION_TTL_DAYS", "0"],
    ["DISCORD_TIMEOUT_MS", "-1"],
    ["MAX_ASSETS_PER_GAME", "2.5"],
    ["MAX_ASSET_TOTAL_BYTES", "lots"],
    ["MAX_EVENTS_PER_GAME", "0"],
    ["WEBHOOK_BATCH_MS", "0"],
    ["WEBHOOK_MAX_PER_MINUTE", "1.5"],
    ["MAX_SPECTATORS", "0"],
  ])("rejects %s=%s", (name, value) => {
    expect(() => loadConfig({ ...required, [name]: value })).toThrow(
      new RegExp(`${name} must be a positive integer`),
    );
  });

  it("takes DISCORD_WEBHOOK_ORIGIN as an origin", () => {
    expect(
      loadConfig({ ...required, DISCORD_WEBHOOK_ORIGIN: "http://127.0.0.1:9/" })
        .discord.webhookOrigin,
    ).toBe("http://127.0.0.1:9");
  });

  it.each([
    "discord.com",
    "ftp://discord.com",
    "https://discord.com/api",
    "https://discord.com/?x=1",
    "https://user:pw@discord.com",
  ])("rejects DISCORD_WEBHOOK_ORIGIN=%s", (value) => {
    expect(() =>
      loadConfig({ ...required, DISCORD_WEBHOOK_ORIGIN: value }),
    ).toThrow(/DISCORD_WEBHOOK_ORIGIN must be an http\(s\) URL origin/);
  });

  it("treats an empty numeric variable as unset", () => {
    expect(
      loadConfig({ ...required, SNAPSHOT_EVERY: "" }).limits.snapshotEvery,
    ).toBe(100);
  });
});
