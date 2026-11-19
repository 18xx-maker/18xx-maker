import {
  createHash,
  createHmac,
  randomBytes,
  timingSafeEqual,
} from "node:crypto";

import { Hono } from "hono";

const STATE_TTL_MS = 10 * 60 * 1000;

export const sha256 = (value) =>
  createHash("sha256").update(value).digest("hex");

const sign = (payload, secret) =>
  createHmac("sha256", secret).update(payload).digest("base64url");

const allowedReturn = (value, config) => {
  if (typeof value !== "string") return null;
  try {
    const url = new URL(value);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    return config.allowedOrigins.includes(url.origin) ? url : null;
  } catch {
    return null;
  }
};

const makeState = (ret, secret) => {
  const payload = Buffer.from(
    JSON.stringify({ return: ret, exp: Date.now() + STATE_TTL_MS }),
  ).toString("base64url");
  return `${payload}.${sign(payload, secret)}`;
};

// Returns the return URL string, or null when the state is invalid or expired
const readState = (state, secret) => {
  if (typeof state !== "string") return null;
  const [payload, mac, ...rest] = state.split(".");
  if (!payload || !mac || rest.length) return null;

  const expected = Buffer.from(sign(payload, secret));
  const given = Buffer.from(mac);
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) {
    return null;
  }

  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString());
    if (typeof data.exp !== "number" || data.exp < Date.now()) return null;
    return typeof data.return === "string" ? data.return : null;
  } catch {
    return null;
  }
};

const discordFetch = async (url, options) => {
  const res = await fetch(url, options);
  if (!res.ok) throw new Error(`Discord responded ${res.status}`);
  return res.json();
};

export const requireUser = (pool) => async (c, next) => {
  const match = /^Bearer (.+)$/.exec(c.req.header("authorization") || "");
  if (!match) return c.json({ error: "Unauthorized" }, 401);

  const { rows } = await pool.query(
    `select u.id, u.name, u.avatar, u.can_create
       from sessions s join users u on u.id = s.user_id
      where s.token_hash = $1`,
    [sha256(match[1])],
  );
  if (!rows.length) return c.json({ error: "Unauthorized" }, 401);

  const user = rows[0];
  c.set("user", {
    id: user.id,
    name: user.name,
    avatar: user.avatar,
    canCreate: user.can_create,
  });
  c.set("tokenHash", sha256(match[1]));
  return next();
};

export const authRoutes = ({ pool, config }) => {
  const app = new Hono();
  const { discord } = config;
  const redirectUri = `${config.publicUrl}/auth/discord/callback`;

  app.get("/auth/discord/login", (c) => {
    const ret = allowedReturn(c.req.query("return"), config);
    if (!ret) return c.json({ error: "Return URL not allowed" }, 400);

    const url = new URL(`${discord.authBase}/authorize`);
    url.searchParams.set("client_id", discord.clientId);
    url.searchParams.set("response_type", "code");
    url.searchParams.set("scope", "identify guilds");
    url.searchParams.set("redirect_uri", redirectUri);
    url.searchParams.set("state", makeState(ret.href, discord.clientSecret));
    return c.redirect(url.href, 302);
  });

  app.get("/auth/discord/callback", async (c) => {
    const returned = readState(c.req.query("state"), discord.clientSecret);
    // Re-check the origin: the allow list may have changed since login
    const ret = returned && allowedReturn(returned, config);
    const code = c.req.query("code");
    if (!ret || !code) return c.json({ error: "Invalid state" }, 400);

    let profile, guilds;
    try {
      const token = await discordFetch(`${discord.apiBase}/oauth2/token`, {
        method: "POST",
        headers: { "content-type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id: discord.clientId,
          client_secret: discord.clientSecret,
          grant_type: "authorization_code",
          code,
          redirect_uri: redirectUri,
        }),
      });
      const headers = { authorization: `Bearer ${token.access_token}` };
      profile = await discordFetch(`${discord.apiBase}/users/@me`, { headers });
      guilds = await discordFetch(`${discord.apiBase}/users/@me/guilds`, {
        headers,
      });
      if (!profile?.id || !Array.isArray(guilds)) throw new Error("bad shape");
    } catch {
      return c.json({ error: "Discord login failed" }, 502);
    }

    const canCreate =
      discord.guildId === "" || guilds.some((g) => g.id === discord.guildId);
    const name = profile.global_name || profile.username || "Player";

    const { rows } = await pool.query(
      `insert into users (discord_id, name, avatar, can_create)
       values ($1, $2, $3, $4)
       on conflict (discord_id) do update
         set name = excluded.name,
             avatar = excluded.avatar,
             can_create = excluded.can_create
       returning id`,
      [profile.id, name, profile.avatar ?? null, canCreate],
    );

    const sessionToken = randomBytes(32).toString("base64url");
    await pool.query(
      "insert into sessions (token_hash, user_id) values ($1, $2)",
      [sha256(sessionToken), rows[0].id],
    );

    ret.hash = `token=${sessionToken}`;
    return c.redirect(ret.href, 302);
  });

  app.get("/me", requireUser(pool), (c) => c.json(c.get("user")));

  app.post("/auth/logout", requireUser(pool), async (c) => {
    await pool.query("delete from sessions where token_hash = $1", [
      c.get("tokenHash"),
    ]);
    return c.json({ ok: true });
  });

  return app;
};
