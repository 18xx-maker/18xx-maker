import { randomBytes } from "node:crypto";

import { Hono } from "hono";

import { validateGameJson } from "../../src/cli/validate.js";
import { requireUser } from "./auth.js";
import { isWebhookUrl } from "./webhook.js";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const ASSET_NAME = /^[\w.-]{1,100}$/;
const STATUSES = ["active", "locked", "archived"];

// Invite and watch codes
const newInviteCode = () => randomBytes(16).toString("base64url");

// Runs fn(client) in a transaction; fn returns the response, rolled back when
// it is a refusal (rollback: true) or throws
const inTransaction = async (pool, fn) => {
  const client = await pool.connect();
  try {
    await client.query("begin");
    const { response, rollback } = await fn(client);
    await client.query(rollback ? "rollback" : "commit");
    return response;
  } catch (err) {
    await client.query("rollback").catch(() => {});
    throw err;
  } finally {
    client.release();
  }
};

// Locks the owner's row so concurrent changes to their game count serialize;
// resolves to the games of the owner that count against gamesPerUser
const lockOwnedCount = async (client, userId) => {
  await client.query("select 1 from users where id = $1 for update", [userId]);
  const { rows } = await client.query(
    `select count(*)::int as n from games
      where owner_id = $1 and status in ('active', 'locked')`,
    [userId],
  );
  return rows[0].n;
};

// Reads the raw body, giving up (null) as soon as it passes the limit
const readCapped = async (c, limit) => {
  const declared = Number(c.req.header("content-length"));
  if (declared > limit) return null;

  const reader = c.req.raw.body?.getReader();
  if (!reader) return Buffer.alloc(0);

  const chunks = [];
  let size = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.length;
    if (size > limit) {
      await reader.cancel();
      return null;
    }
    chunks.push(value);
  }
  return Buffer.concat(chunks);
};

const SMALL_BYTES = 4096;

// Small JSON bodies: undefined when too large, null when not valid JSON
const readSmallJson = async (c) => {
  const raw = await readCapped(c, SMALL_BYTES);
  if (!raw) return undefined;
  try {
    return JSON.parse(raw.toString("utf8"));
  } catch {
    return null;
  }
};

const seatJson = (row) => ({
  userId: row.user_id,
  name: row.name,
  color: row.color,
});

// The names of a game's assets, for the board to fetch
const assetNames = async (pool, gameId) => {
  const { rows } = await pool.query(
    "select name from game_assets where game_id = $1 order by name",
    [gameId],
  );
  return rows.map((r) => r.name);
};

const seatsOf = async (pool, gameId) => {
  const { rows } = await pool.query(
    "select user_id, name, color from seats where game_id = $1 order by created_at",
    [gameId],
  );
  return rows.map(seatJson);
};

// The asset as a download that is never rendered in place
const assetResponse = (c, row) =>
  c.body(row.data, 200, {
    "Content-Type": row.content_type,
    "X-Content-Type-Options": "nosniff",
    "Content-Disposition": "attachment",
  });

// notifier: the webhook notifier (webhook.js), for the test post of a webhook;
// sockets: the hub's { closeWatchers }, absent without a websocket hub
export const gameRoutes = ({ pool, config, notifier, sockets }) => {
  const app = new Hono();
  const { limits } = config;
  const auth = requireUser(pool);

  // Loads the game and the caller's membership; null when not a member
  const membership = async (id, user) => {
    if (!UUID.test(id)) return null;
    const { rows } = await pool.query(
      `select g.* from games g
         join seats s on s.game_id = g.id and s.user_id = $2
        where g.id = $1`,
      [id, user.id],
    );
    return rows[0] || null;
  };

  // Resolves to a response when the caller may not act as the owner
  const ownerOnly = async (c) => {
    const row = await membership(c.req.param("id"), c.get("user"));
    if (!row) return { fail: c.json({ error: "Not found" }, 404) };
    if (row.owner_id !== c.get("user").id) {
      return { fail: c.json({ error: "Forbidden" }, 403) };
    }
    return { row };
  };

  app.post("/games", auth, async (c) => {
    const user = c.get("user");
    if (!user.canCreate) return c.json({ error: "Forbidden" }, 403);

    const raw = await readCapped(c, limits.gameBytes);
    if (!raw) return c.json({ error: "Game too large" }, 413);

    let body;
    try {
      body = JSON.parse(raw.toString("utf8"));
    } catch {
      return c.json({ error: "Invalid JSON" }, 400);
    }
    const { game, config: gameConfig = {}, seatName } = body || {};
    if (!game || typeof game !== "object" || Array.isArray(game)) {
      return c.json({ error: "game is required" }, 400);
    }
    if (
      gameConfig === null ||
      typeof gameConfig !== "object" ||
      Array.isArray(gameConfig)
    ) {
      return c.json({ error: "config must be an object" }, 400);
    }

    const result = validateGameJson(game);
    if (!result.valid) {
      return c.json({ errors: result.validationErrors }, 422);
    }

    const title = game.info?.title || "Untitled";
    const inviteCode = newInviteCode();
    const name =
      typeof seatName === "string" && seatName.trim()
        ? seatName.trim().slice(0, 50)
        : user.name;

    return inTransaction(pool, async (client) => {
      // Serialise concurrent creates by one user so the cap cannot be raced
      if ((await lockOwnedCount(client, user.id)) >= limits.gamesPerUser) {
        return {
          rollback: true,
          response: c.json({ error: "Too many games" }, 429),
        };
      }
      const { rows } = await client.query(
        `insert into games (title, owner_id, game_json, config_json, invite_code)
         values ($1, $2, $3, $4, $5) returning id`,
        [title, user.id, game, gameConfig, inviteCode],
      );
      await client.query(
        "insert into seats (game_id, user_id, name) values ($1, $2, $3)",
        [rows[0].id, user.id, name],
      );
      return { response: c.json({ id: rows[0].id, inviteCode }, 201) };
    });
  });

  app.get("/games", auth, async (c) => {
    const { rows } = await pool.query(
      `select g.id, g.title, g.status, g.owner_id,
              coalesce(
                (select max(e.created_at) from events e where e.game_id = g.id),
                g.created_at
              ) as updated_at
         from games g join seats s on s.game_id = g.id
        where s.user_id = $1
        order by updated_at desc`,
      [c.get("user").id],
    );
    return c.json(
      rows.map((r) => ({
        id: r.id,
        title: r.title,
        status: r.status,
        ownerId: r.owner_id,
        updatedAt: r.updated_at,
      })),
    );
  });

  app.get("/games/:id", auth, async (c) => {
    const user = c.get("user");
    const row = await membership(c.req.param("id"), user);
    if (!row) return c.json({ error: "Not found" }, 404);

    return c.json({
      id: row.id,
      title: row.title,
      status: row.status,
      ownerId: row.owner_id,
      game: row.game_json,
      config: row.config_json,
      seats: await seatsOf(pool, row.id),
      assets: await assetNames(pool, row.id),
      // The webhook URL is a secret: never returned, the owner sees if one is set
      ...(row.owner_id === user.id
        ? {
            inviteCode: row.invite_code,
            watchCode: row.watch_code,
            webhookSet: row.webhook_url !== null,
          }
        : {}),
    });
  });

  app.patch("/games/:id", auth, async (c) => {
    const { row, fail } = await ownerOnly(c);
    if (fail) return fail;

    const body = await readSmallJson(c);
    if (body === undefined) return c.json({ error: "Body too large" }, 413);
    const has = (key) =>
      body !== null && typeof body === "object" && Object.hasOwn(body, key);
    const setStatus = has("status");
    const setWebhook = has("webhookUrl");
    if ((setStatus || !setWebhook) && !STATUSES.includes(body?.status)) {
      return c.json({ error: "Invalid status" }, 400);
    }
    const webhookUrl = setWebhook ? body.webhookUrl : undefined;
    if (
      setWebhook &&
      webhookUrl !== null &&
      !isWebhookUrl(webhookUrl, config.discord.webhookOrigin)
    ) {
      return c.json({ error: "Invalid webhook URL" }, 400);
    }
    // The test post comes first, so a webhook Discord does not know (401/404)
    // is refused before anything is written
    if (webhookUrl) {
      const test = await notifier.connected(row.id, webhookUrl);
      if (test === "limited") {
        return c.json({ error: "Too many requests" }, 429);
      }
      if (test === "rejected") {
        return c.json({ error: "Discord rejected the webhook" }, 400);
      }
    }
    const user = c.get("user");
    return inTransaction(pool, async (client) => {
      const count = setStatus ? await lockOwnedCount(client, user.id) : 0;
      const { rows } = await client.query(
        "select status from games where id = $1 for update",
        [row.id],
      );
      if (!rows.length) {
        return {
          rollback: true,
          response: c.json({ error: "Not found" }, 404),
        };
      }
      // Bringing an archived game back counts against the cap like a new one
      if (
        setStatus &&
        rows[0].status === "archived" &&
        body.status !== "archived" &&
        count >= limits.gamesPerUser
      ) {
        return {
          rollback: true,
          response: c.json({ error: "Too many games" }, 409),
        };
      }
      const { rows: updated } = await client.query(
        `update games
            set status = coalesce($2, status),
                webhook_url = case when $3 then $4 else webhook_url end
          where id = $1
          returning status, webhook_url is not null as webhook_set`,
        [
          row.id,
          setStatus ? body.status : null,
          setWebhook,
          webhookUrl ?? null,
        ],
      );
      return {
        response: c.json({
          id: row.id,
          status: updated[0].status,
          webhookSet: updated[0].webhook_set,
        }),
      };
    });
  });

  app.delete("/games/:id", auth, async (c) => {
    const { row, fail } = await ownerOnly(c);
    if (fail) return fail;
    await pool.query("delete from games where id = $1", [row.id]);
    return c.body(null, 204);
  });

  app.post("/games/:id/invite", auth, async (c) => {
    const { row, fail } = await ownerOnly(c);
    if (fail) return fail;
    const inviteCode = newInviteCode();
    await pool.query("update games set invite_code = $2 where id = $1", [
      row.id,
      inviteCode,
    ]);
    return c.json({ inviteCode });
  });

  // The spectator link: a new code (the old one stops working) or none. Open
  // spectator sockets of the game are closed either way; a spectator join
  // still in flight checks the code again once it is in the room
  const setWatchCode = async (gameId, watchCode) => {
    await pool.query("update games set watch_code = $2 where id = $1", [
      gameId,
      watchCode,
    ]);
    sockets?.closeWatchers(gameId);
  };

  app.post("/games/:id/watch", auth, async (c) => {
    const { row, fail } = await ownerOnly(c);
    if (fail) return fail;
    const watchCode = newInviteCode();
    await setWatchCode(row.id, watchCode);
    return c.json({ watchCode });
  });

  app.delete("/games/:id/watch", auth, async (c) => {
    const { row, fail } = await ownerOnly(c);
    if (fail) return fail;
    await setWatchCode(row.id, null);
    return c.body(null, 204);
  });

  // Public, read-only: the watch code is the only credential
  const watched = async (code) => {
    const { rows } = await pool.query(
      `select id, title, status, game_json, config_json from games
        where watch_code = $1`,
      [code],
    );
    return rows[0] || null;
  };

  app.get("/watch/:code", async (c) => {
    const { rows } = await pool.query(
      "select id, title from games where watch_code = $1",
      [c.req.param("code")],
    );
    if (!rows.length) return c.json({ error: "Not found" }, 404);
    return c.json({ gameId: rows[0].id, title: rows[0].title });
  });

  // What a spectator needs to draw the game: no owner, invite or webhook
  app.get("/watch/:code/game", async (c) => {
    const row = await watched(c.req.param("code"));
    if (!row) return c.json({ error: "Not found" }, 404);
    return c.json({
      id: row.id,
      title: row.title,
      status: row.status,
      game: row.game_json,
      config: row.config_json,
      seats: await seatsOf(pool, row.id),
      assets: await assetNames(pool, row.id),
    });
  });

  app.get("/watch/:code/assets/:name", async (c) => {
    // One query: an unknown code and an unknown name are the same 404
    const { rows } = await pool.query(
      `select a.content_type, a.data from game_assets a
         join games g on g.id = a.game_id
        where g.watch_code = $1 and a.name = $2`,
      [c.req.param("code"), c.req.param("name")],
    );
    if (!rows.length) return c.json({ error: "Not found" }, 404);
    return assetResponse(c, rows[0]);
  });

  app.get("/invites/:code", async (c) => {
    const { rows } = await pool.query(
      "select id, title from games where invite_code = $1",
      [c.req.param("code")],
    );
    if (!rows.length) return c.json({ error: "Not found" }, 404);
    return c.json({ gameId: rows[0].id, title: rows[0].title });
  });

  app.post("/invites/:code/join", auth, async (c) => {
    const user = c.get("user");
    const code = c.req.param("code");

    const body = await readSmallJson(c);
    if (body === undefined) return c.json({ error: "Body too large" }, 413);
    const name = typeof body?.name === "string" ? body.name.trim() : "";
    if (!name || name.length > 50) {
      return c.json({ error: "A name is required" }, 400);
    }
    const color =
      typeof body.color === "string" && body.color.length <= 30
        ? body.color
        : null;

    // One statement, so a lock or delete cannot land between check and insert
    const { rows: added } = await pool.query(
      `insert into seats (game_id, user_id, name, color)
       select g.id, $2, $3, $4 from games g
        where g.invite_code = $1 and g.status = 'active'
       on conflict do nothing
       returning user_id, name, color`,
      [code, user.id, name, color],
    );
    if (added.length) return c.json(seatJson(added[0]));

    const { rows } = await pool.query(
      "select id, status from games where invite_code = $1",
      [code],
    );
    if (!rows.length) return c.json({ error: "Not found" }, 404);
    if (rows[0].status !== "active") {
      return c.json({ error: "Game is not open" }, 410);
    }
    const { rows: seat } = await pool.query(
      "select user_id, name, color from seats where game_id = $1 and user_id = $2",
      [rows[0].id, user.id],
    );
    if (!seat.length) return c.json({ error: "Not found" }, 404);
    return c.json(seatJson(seat[0]));
  });

  app.put("/games/:id/assets/:name", auth, async (c) => {
    const { row, fail } = await ownerOnly(c);
    if (fail) return fail;

    const name = c.req.param("name");
    if (!ASSET_NAME.test(name)) return c.json({ error: "Invalid name" }, 400);

    const data = await readCapped(c, limits.assetBytes);
    if (!data) return c.json({ error: "Asset too large" }, 413);

    const type = c.req.header("content-type") || "application/octet-stream";
    return inTransaction(pool, async (client) => {
      // The game row lock serializes uploads, so the caps cannot be raced
      const game = await client.query(
        "select 1 from games where id = $1 for update",
        [row.id],
      );
      if (!game.rows.length) {
        return {
          rollback: true,
          response: c.json({ error: "Not found" }, 404),
        };
      }
      // The asset being replaced does not count
      const { rows } = await client.query(
        `select count(*)::int as n,
                coalesce(sum(octet_length(data)), 0)::float8 as bytes
           from game_assets where game_id = $1 and name <> $2`,
        [row.id, name],
      );
      if (rows[0].n >= limits.assetsPerGame) {
        return {
          rollback: true,
          response: c.json({ error: "Too many assets" }, 413),
        };
      }
      if (rows[0].bytes + data.length > limits.assetTotalBytes) {
        return {
          rollback: true,
          response: c.json({ error: "Assets too large in total" }, 413),
        };
      }
      await client.query(
        `insert into game_assets (game_id, name, content_type, data)
         values ($1, $2, $3, $4)
         on conflict (game_id, name) do update
           set content_type = excluded.content_type, data = excluded.data`,
        [row.id, name, type, data],
      );
      return { response: c.body(null, 204) };
    });
  });

  app.get("/games/:id/assets/:name", auth, async (c) => {
    const row = await membership(c.req.param("id"), c.get("user"));
    if (!row) return c.json({ error: "Not found" }, 404);

    const { rows } = await pool.query(
      "select content_type, data from game_assets where game_id = $1 and name = $2",
      [row.id, c.req.param("name")],
    );
    if (!rows.length) return c.json({ error: "Not found" }, 404);
    return assetResponse(c, rows[0]);
  });

  return app;
};
