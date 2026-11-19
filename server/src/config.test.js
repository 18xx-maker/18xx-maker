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
      },
      limits: {
        gameBytes: 2097152,
        assetBytes: 1048576,
        gamesPerUser: 50,
        eventsPerSecond: 10,
        snapshotEvery: 100,
        joinTimeoutMs: 10000,
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
    });
    expect(config.port).toBe(9000);
    expect(config.allowedOrigins).toEqual(["https://a.com", "https://b.com"]);
    expect(config.limits).toEqual({
      gameBytes: 10,
      assetBytes: 20,
      gamesPerUser: 3,
      eventsPerSecond: 4,
      snapshotEvery: 5,
      joinTimeoutMs: 50,
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
  ])("rejects %s=%s", (name, value) => {
    expect(() => loadConfig({ ...required, [name]: value })).toThrow(
      new RegExp(`${name} must be a positive integer`),
    );
  });

  it("treats an empty numeric variable as unset", () => {
    expect(
      loadConfig({ ...required, SNAPSHOT_EVERY: "" }).limits.snapshotEvery,
    ).toBe(100);
  });
});
