import { createHash, createHmac } from "node:crypto";

import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { hasDb, makeTestDb } from "../test/db.js";
import { startFakeDiscord } from "../test/discord.js";
import { createApp } from "./app.js";
import { loadConfig } from "./config.js";

const RETURN = "http://app.test/play";

describe.skipIf(!hasDb)("discord auth", () => {
  let db, discord, app, config;

  beforeAll(async () => {
    db = await makeTestDb();
    discord = await startFakeDiscord({
      users: [
        {
          code: "in",
          id: "1",
          username: "Ann",
          avatar: "a1",
          guilds: ["g", "h"],
        },
        { code: "out", id: "2", username: "Bob", avatar: null, guilds: ["h"] },
        {
          code: "bad",
          id: "3",
          username: "Cy",
          guilds: ["g"],
          failGuilds: true,
        },
      ],
    });
    config = loadConfig({
      DATABASE_URL: "x",
      PUBLIC_URL: "http://play.test",
      DISCORD_CLIENT_ID: "cid",
      DISCORD_CLIENT_SECRET: "secret",
      DISCORD_GUILD_ID: "g",
      DISCORD_API_BASE: discord.url,
      DISCORD_AUTH_BASE: `${discord.url}/oauth2`,
      ALLOWED_ORIGINS: "http://app.test",
    });
    app = createApp({ pool: db.pool, config });
  });

  afterAll(async () => {
    await discord.close();
    await db.close();
  });

  const login = async (ret = RETURN) => {
    const res = await app.request(
      `/auth/discord/login?return=${encodeURIComponent(ret)}`,
    );
    return res;
  };

  const stateOf = async () => {
    const res = await login();
    return new URL(res.headers.get("location")).searchParams.get("state");
  };

  const signIn = async (code) => {
    const state = await stateOf();
    return app.request(
      `/auth/discord/callback?code=${code}&state=${encodeURIComponent(state)}`,
    );
  };

  const tokenOf = (res) =>
    new URLSearchParams(new URL(res.headers.get("location")).hash.slice(1)).get(
      "token",
    );

  it("login redirects to Discord with the state and scopes", async () => {
    const res = await login();
    expect(res.status).toBe(302);
    const url = new URL(res.headers.get("location"));
    expect(url.origin + url.pathname).toBe(`${discord.url}/oauth2/authorize`);
    expect(url.searchParams.get("client_id")).toBe("cid");
    expect(url.searchParams.get("scope")).toBe("identify guilds");
    expect(url.searchParams.get("response_type")).toBe("code");
    expect(url.searchParams.get("redirect_uri")).toBe(
      "http://play.test/auth/discord/callback",
    );
    expect(url.searchParams.get("state")).toBeTruthy();
  });

  it("login refuses a return origin that is not allowed", async () => {
    expect((await login("http://evil.test/x")).status).toBe(400);
    expect((await login("not a url")).status).toBe(400);
    expect((await app.request("/auth/discord/login")).status).toBe(400);
  });

  it("callback creates a user and a session and redirects with the token", async () => {
    const res = await signIn("in");
    expect(res.status).toBe(302);
    const location = new URL(res.headers.get("location"));
    expect(location.origin + location.pathname).toBe(RETURN);
    const token = tokenOf(res);
    expect(token).toMatch(/^[A-Za-z0-9_-]{43}$/);

    const me = await app.request("/me", {
      headers: { authorization: `Bearer ${token}` },
    });
    expect(me.status).toBe(200);
    const user = await me.json();
    expect(user).toMatchObject({ name: "Ann", avatar: "a1", canCreate: true });

    // a second login reuses the user
    await signIn("in");
    const { rows } = await db.pool.query(
      "select count(*)::int n from users where discord_id = '1'",
    );
    expect(rows[0].n).toBe(1);
  });

  it("callback sets can_create false for a user outside the guild and true inside", async () => {
    const outside = await signIn("out");
    const inside = await signIn("in");
    const get = async (res) =>
      (
        await app.request("/me", {
          headers: { authorization: `Bearer ${tokenOf(res)}` },
        })
      ).json();
    expect((await get(outside)).canCreate).toBe(false);
    expect((await get(inside)).canCreate).toBe(true);
  });

  it("callback with a bad or expired state returns 400", async () => {
    const good = await stateOf();
    const [payload] = good.split(".");
    const forged = `${payload}.${Buffer.from("nope").toString("base64url")}`;
    const sign = (p, key) =>
      createHmac("sha256", key).update(p).digest("base64url");

    const expiredPayload = Buffer.from(
      JSON.stringify({ return: RETURN, exp: Date.now() - 1000 }),
    ).toString("base64url");
    const expired = `${expiredPayload}.${sign(expiredPayload, "secret")}`;

    const evilPayload = Buffer.from(
      JSON.stringify({ return: "http://evil.test/", exp: Date.now() + 60000 }),
    ).toString("base64url");
    const evil = `${evilPayload}.${sign(evilPayload, "secret")}`;

    for (const state of [forged, expired, evil, "garbage", ""]) {
      const res = await app.request(
        `/auth/discord/callback?code=in&state=${encodeURIComponent(state)}`,
      );
      expect(res.status).toBe(400);
    }
  });

  it("callback when the Discord token or guilds call fails returns 502 and creates no session", async () => {
    const before = (await db.pool.query("select count(*)::int n from sessions"))
      .rows[0].n;
    expect((await signIn("bad")).status).toBe(502);
    expect((await signIn("unknown-code")).status).toBe(502);
    const after = (await db.pool.query("select count(*)::int n from sessions"))
      .rows[0].n;
    expect(after).toBe(before);
    const { rows } = await db.pool.query(
      "select 1 from users where discord_id = '3'",
    );
    expect(rows).toHaveLength(0);
  });

  it("GET /me with the token returns the user, without it 401", async () => {
    const token = tokenOf(await signIn("in"));
    const ok = await app.request("/me", {
      headers: { authorization: `Bearer ${token}` },
    });
    expect(ok.status).toBe(200);
    expect(Object.keys(await ok.json()).sort()).toEqual([
      "avatar",
      "canCreate",
      "id",
      "name",
    ]);
    expect((await app.request("/me")).status).toBe(401);
    expect(
      (
        await app.request("/me", {
          headers: { authorization: "Bearer nope" },
        })
      ).status,
    ).toBe(401);
  });

  it("logout invalidates the token", async () => {
    const token = tokenOf(await signIn("in"));
    const headers = { authorization: `Bearer ${token}` };
    expect(
      (await app.request("/auth/logout", { method: "POST", headers })).status,
    ).toBe(200);
    expect((await app.request("/me", { headers })).status).toBe(401);
  });

  it("the session table stores a hash, never the token", async () => {
    const token = tokenOf(await signIn("in"));
    const hash = createHash("sha256").update(token).digest("hex");
    const { rows } = await db.pool.query("select token_hash from sessions");
    const hashes = rows.map((r) => r.token_hash);
    expect(hashes).toContain(hash);
    expect(hashes).not.toContain(token);
  });

  it("serves /health and CORS for allowed origins only", async () => {
    const res = await app.request("/health", {
      headers: { origin: "http://app.test" },
    });
    expect(await res.json()).toEqual({ ok: true });
    expect(res.headers.get("access-control-allow-origin")).toBe(
      "http://app.test",
    );
    const other = await app.request("/health", {
      headers: { origin: "http://evil.test" },
    });
    expect(other.headers.get("access-control-allow-origin")).toBeNull();
  });
});
