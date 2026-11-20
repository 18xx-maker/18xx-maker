import { createHash, randomBytes } from "node:crypto";

import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import { createServer } from "../src/app.js";
import { loadConfig } from "../src/config.js";
import { appendEvent, eventsSince } from "../src/events.js";
import { connect } from "./client.js";
import { hasDb, makeTestDb } from "./db.js";

const note = (text) => ({ type: "note.set", text });
const ORIGIN = "http://site.test";

describe.skipIf(!hasDb)("spectator link", () => {
  let db;
  let running = [];

  const configFor = (extra = {}) =>
    loadConfig({
      DATABASE_URL: "x",
      PUBLIC_URL: "http://play.test",
      DISCORD_CLIENT_ID: "cid",
      DISCORD_CLIENT_SECRET: "secret",
      ALLOWED_ORIGINS: ORIGIN,
      ...extra,
    });

  // A real server on port 0; its clients are closed after the test
  const start = async (extra = {}, pool = db.pool) => {
    const server = createServer({ pool, config: configFor(extra) });
    await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
    const { port } = server.address();
    const clients = [];
    const entry = {
      base: `http://127.0.0.1:${port}`,
      client: () => {
        const c = connect(`ws://127.0.0.1:${port}/ws`);
        clients.push(c);
        return c;
      },
      stop: async () => {
        await Promise.all(clients.map((c) => c.close()));
        await new Promise((resolve) => server.close(resolve));
      },
    };
    running.push(entry);
    return entry;
  };

  // A pool whose next matching query runs, then holds its result until
  // released: the caller acts on what was true before the hold
  const gatedPool = () => {
    const gates = [];
    return {
      query: async (sql, params) => {
        const result = await db.pool.query(sql, params);
        const i = gates.findIndex((g) => g.match(sql));
        if (i >= 0) {
          const [gate] = gates.splice(i, 1);
          gate.reached();
          await gate.released;
        }
        return result;
      },
      connect: () => db.pool.connect(),
      hold: (match) => {
        let release;
        const released = new Promise((resolve) => (release = resolve));
        return new Promise((resolve) => {
          gates.push({ match, released, reached: () => resolve(release) });
        });
      },
    };
  };

  const makeUser = async (name) => {
    const token = randomBytes(16).toString("hex");
    const { rows } = await db.pool.query(
      "insert into users (discord_id, name) values ($1, $2) returning id",
      [randomBytes(8).toString("hex"), name],
    );
    await db.pool.query(
      "insert into sessions (token_hash, user_id) values ($1, $2)",
      [createHash("sha256").update(token).digest("hex"), rows[0].id],
    );
    return { id: rows[0].id, token, name };
  };

  const makeGame = async (players, status = "active") => {
    const { rows } = await db.pool.query(
      `insert into games (title, owner_id, game_json, config_json, invite_code, status, webhook_url)
       values ('Watched', $1, '{"info":{"title":"Watched"}}', '{"a":1}', $2, $3,
               'https://discord.com/api/webhooks/1/secret-hook')
       returning id, invite_code`,
      [players[0].id, randomBytes(12).toString("hex"), status],
    );
    for (const p of players) {
      await db.pool.query(
        "insert into seats (game_id, user_id, name, color) values ($1, $2, $3, 'red')",
        [rows[0].id, p.id, p.name],
      );
    }
    return { id: rows[0].id, inviteCode: rows[0].invite_code };
  };

  const api = async (s, user, method, path, body) => {
    const res = await fetch(`${s.base}${path}`, {
      method,
      headers: {
        ...(user ? { authorization: `Bearer ${user.token}` } : {}),
        ...(body === undefined ? {} : { "content-type": "application/json" }),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    const text = await res.text();
    let json;
    try {
      json = text ? JSON.parse(text) : null;
    } catch {
      json = text;
    }
    return { status: res.status, body: json, text, headers: res.headers };
  };

  const watchLink = async (s, owner, gameId) => {
    const res = await api(s, owner, "POST", `/games/${gameId}/watch`);
    expect(res.status).toBe(200);
    return res.body.watchCode;
  };

  const joinPlayer = async (c, user, gameId, lastSeq = 0) => {
    await c.send({ t: "join", token: user.token, gameId, lastSeq });
    const joined = await c.next("joined");
    await c.next("events");
    return joined;
  };

  const watch = async (c, code, lastSeq = 0) => {
    await c.send({ t: "join", watch: code, lastSeq });
    return c.next("joined");
  };

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  let ann, bob, eve;

  beforeAll(async () => {
    db = await makeTestDb();
    ann = await makeUser("Ann");
    bob = await makeUser("Bob");
    eve = await makeUser("Eve");
  });

  afterEach(async () => {
    await Promise.all(running.map((r) => r.stop()));
    running = [];
  });

  afterAll(async () => {
    await db?.close();
  });

  it("only the owner creates the link; GET /games/:id shows it to the owner only", async () => {
    const s = await start();
    const g = await makeGame([ann, bob]);

    expect((await api(s, bob, "POST", `/games/${g.id}/watch`)).status).toBe(
      403,
    );
    expect((await api(s, eve, "POST", `/games/${g.id}/watch`)).status).toBe(
      404,
    );
    expect((await api(s, null, "POST", `/games/${g.id}/watch`)).status).toBe(
      401,
    );
    expect((await api(s, bob, "DELETE", `/games/${g.id}/watch`)).status).toBe(
      403,
    );

    const before = await api(s, ann, "GET", `/games/${g.id}`);
    expect(before.body.watchCode).toBeNull();

    const code = await watchLink(s, ann, g.id);
    expect(code).toMatch(/^[\w-]{22}$/);

    const owner = await api(s, ann, "GET", `/games/${g.id}`);
    expect(owner.body.watchCode).toBe(code);
    const guest = await api(s, bob, "GET", `/games/${g.id}`);
    expect("watchCode" in guest.body).toBe(false);
    expect(guest.text).not.toContain(code);
  });

  it("GET /games/:id lists the asset names for every seat holder", async () => {
    const s = await start();
    const g = await makeGame([ann, bob]);
    expect((await api(s, bob, "GET", `/games/${g.id}`)).body.assets).toEqual(
      [],
    );
    for (const name of ["b.svg", "a.png"]) {
      const put = await fetch(`${s.base}/games/${g.id}/assets/${name}`, {
        method: "PUT",
        headers: {
          authorization: `Bearer ${ann.token}`,
          "content-type": "image/svg+xml",
        },
        body: "<svg/>",
      });
      expect(put.status).toBe(204);
    }
    for (const user of [ann, bob]) {
      expect((await api(s, user, "GET", `/games/${g.id}`)).body.assets).toEqual(
        ["a.png", "b.svg"],
      );
    }
  });

  it("the public watch routes return the game without any secret", async () => {
    const s = await start();
    const g = await makeGame([ann, bob]);
    const code = await watchLink(s, ann, g.id);

    expect(await api(s, null, "GET", `/watch/${code}`)).toMatchObject({
      status: 200,
      body: { gameId: g.id, title: "Watched" },
    });

    const res = await api(s, null, "GET", `/watch/${code}/game`);
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      id: g.id,
      title: "Watched",
      status: "active",
      game: { info: { title: "Watched" } },
      config: { a: 1 },
      seats: [
        { userId: ann.id, name: "Ann", color: "red" },
        { userId: bob.id, name: "Bob", color: "red" },
      ],
      assets: [],
    });
    for (const secret of [
      g.inviteCode,
      "secret-hook",
      "inviteCode",
      "webhook",
      "ownerId",
      ann.token,
    ]) {
      expect(res.text).not.toContain(secret);
    }
  });

  it("an unknown code is 404 on every watch route and the websocket", async () => {
    const s = await start();
    for (const path of [
      "/watch/nope",
      "/watch/nope/game",
      "/watch/nope/assets/a.svg",
    ]) {
      const res = await api(s, null, "GET", path);
      expect(res.status).toBe(404);
      expect(res.body).toEqual({ error: "Not found" });
    }
    const c = s.client();
    await c.send({ t: "join", watch: "nope", lastSeq: 0 });
    expect(await c.next("error")).toMatchObject({ code: "not_member" });
    expect((await c.closed).code).toBe(4003);
  });

  it("serves the game's assets through the watch route and nothing else", async () => {
    const s = await start();
    const g = await makeGame([ann]);
    const other = await makeGame([ann]);
    const code = await watchLink(s, ann, g.id);
    const put = (id, name, body) =>
      fetch(`${s.base}/games/${id}/assets/${name}`, {
        method: "PUT",
        headers: {
          authorization: `Bearer ${ann.token}`,
          "content-type": "image/svg+xml",
        },
        body,
      });
    expect((await put(g.id, "logo.svg", "<svg>mine</svg>")).status).toBe(204);
    expect((await put(other.id, "theirs.svg", "<svg/>")).status).toBe(204);

    const res = await api(s, null, "GET", `/watch/${code}/assets/logo.svg`);
    expect(res.status).toBe(200);
    expect(res.text).toBe("<svg>mine</svg>");
    expect(res.headers.get("content-type")).toBe("image/svg+xml");
    expect(res.headers.get("x-content-type-options")).toBe("nosniff");
    expect(res.headers.get("content-disposition")).toBe("attachment");

    expect(
      (await api(s, null, "GET", `/watch/${code}/assets/theirs.svg`)).status,
    ).toBe(404);
    expect(
      (await api(s, null, "GET", `/watch/${code}/assets/missing.svg`)).status,
    ).toBe(404);
    expect(
      (await api(s, null, "GET", `/watch/${code}/game`)).body.assets,
    ).toEqual(["logo.svg"]);
  });

  it("CORS allows the watch routes for an allowed origin", async () => {
    const s = await start();
    const res = await fetch(`${s.base}/watch/x/game`, {
      method: "OPTIONS",
      headers: {
        origin: ORIGIN,
        "access-control-request-method": "GET",
      },
    });
    expect(res.headers.get("access-control-allow-origin")).toBe(ORIGIN);
    const get = await fetch(`${s.base}/watch/x`, {
      headers: { origin: ORIGIN },
    });
    expect(get.headers.get("access-control-allow-origin")).toBe(ORIGIN);
  });

  it("a spectator gets catch-up and live events but is never in presence", async () => {
    const s = await start();
    const g = await makeGame([ann, bob]);
    const config = configFor();
    for (const seq of [1, 2]) {
      await appendEvent(db.pool, config, {
        gameId: g.id,
        userId: ann.id,
        seq,
        event: note(`n${seq}`),
      });
    }
    const code = await watchLink(s, ann, g.id);

    const a = s.client();
    const joinedA = await joinPlayer(a, ann, g.id, 2);
    expect(joinedA.presence).toEqual([ann.id]);

    const spec = s.client();
    const joined = await watch(spec, code, 1);
    expect(joined).toEqual({
      t: "joined",
      seq: 2,
      spectator: true,
      seats: [
        { userId: ann.id, name: "Ann", color: "red" },
        { userId: bob.id, name: "Bob", color: "red" },
      ],
      presence: [ann.id],
    });
    const catchUp = await spec.next("events");
    expect(catchUp.events.map((e) => e.seq)).toEqual([2]);

    // The player's view is what it was without the spectator
    const b = s.client();
    const joinedB = await joinPlayer(b, bob, g.id, 2);
    expect(joinedB.presence.sort()).toEqual([ann.id, bob.id].sort());
    expect(joinedB.seats).toEqual(joined.seats);
    expect("spectator" in joinedB).toBe(false);

    const seen = await spec.next("presence");
    expect(seen.users.sort()).toEqual([ann.id, bob.id].sort());

    await a.send({ t: "event", seq: 3, event: note("live") });
    expect((await spec.next("event")).event).toMatchObject({
      seq: 3,
      userId: ann.id,
      type: "note.set",
      text: "live",
    });

    // A spectator that leaves sends no presence change; every presence the
    // players saw lists players only
    await spec.close();
    await b.close();
    const last = await a.next("presence");
    const all = [last, ...a.pending().filter((m) => m.t === "presence")];
    for (const p of all) {
      expect(p.users.every((u) => u === ann.id || u === bob.id)).toBe(true);
    }
  });

  it("an event frame from a spectator is refused and nothing is appended", async () => {
    const s = await start();
    const g = await makeGame([ann]);
    const code = await watchLink(s, ann, g.id);
    const spec = s.client();
    await watch(spec, code);
    await spec.next("events");

    await spec.send({ t: "event", seq: 1, event: note("sneaky") });
    expect(await spec.next("error")).toEqual({
      t: "error",
      code: "not_member",
    });
    await sleep(50);
    expect(await eventsSince(db.pool, g.id, 0)).toEqual([]);
    // Still watching: a player's event reaches it
    const a = s.client();
    await joinPlayer(a, ann, g.id);
    await a.send({ t: "event", seq: 1, event: note("real") });
    expect((await spec.next("event")).event.text).toBe("real");
  });

  it("spectator event frames count against the per-socket rate limit", async () => {
    const s = await start({ MAX_EVENTS_PER_SECOND: "2" });
    const g = await makeGame([ann]);
    const code = await watchLink(s, ann, g.id);
    const spec = s.client();
    await watch(spec, code);
    await spec.next("events");
    for (let i = 0; i < 3; i++) {
      await spec.send({ t: "event", seq: 1, event: note("x") });
    }
    const codes = [];
    for (let i = 0; i < 3; i++) codes.push((await spec.next("error")).code);
    expect(codes).toEqual(["not_member", "not_member", "rate_limited"]);
  });

  it("rejects a join with both a token and a watch code, or another gameId", async () => {
    const s = await start();
    const g = await makeGame([ann]);
    const h = await makeGame([ann]);
    const code = await watchLink(s, ann, g.id);

    const both = s.client();
    await both.send({
      t: "join",
      token: ann.token,
      watch: code,
      gameId: g.id,
      lastSeq: 0,
    });
    expect(await both.next("error")).toMatchObject({ code: "invalid" });

    const wrong = s.client();
    await wrong.send({ t: "join", watch: code, gameId: h.id, lastSeq: 0 });
    expect(await wrong.next("error")).toMatchObject({ code: "not_member" });
    expect((await wrong.closed).code).toBe(4003);

    const right = s.client();
    await right.send({ t: "join", watch: code, gameId: g.id, lastSeq: 0 });
    expect((await right.next("joined")).spectator).toBe(true);
  });

  it("rotating the link stops the old code and closes its open spectators", async () => {
    const s = await start();
    const g = await makeGame([ann]);
    const old = await watchLink(s, ann, g.id);
    const spec = s.client();
    await watch(spec, old);
    await spec.next("events");
    const a = s.client();
    await joinPlayer(a, ann, g.id);

    const fresh = await watchLink(s, ann, g.id);
    expect(fresh).not.toBe(old);
    expect(await spec.next("error")).toMatchObject({ code: "not_member" });
    expect((await spec.closed).code).toBe(4003);

    for (const path of [`/watch/${old}`, `/watch/${old}/game`]) {
      expect((await api(s, null, "GET", path)).status).toBe(404);
    }
    expect((await api(s, null, "GET", `/watch/${fresh}`)).status).toBe(200);
    const again = s.client();
    await again.send({ t: "join", watch: old, lastSeq: 0 });
    expect(await again.next("error")).toMatchObject({ code: "not_member" });

    // The player stays connected
    await a.send({ t: "event", seq: 1, event: note("still here") });
    expect((await a.next("event")).event.seq).toBe(1);
  });

  it("deleting the link closes its open spectators and every route is 404", async () => {
    const s = await start();
    const g = await makeGame([ann]);
    const code = await watchLink(s, ann, g.id);
    const spec = s.client();
    await watch(spec, code);
    await spec.next("events");

    const del = await api(s, ann, "DELETE", `/games/${g.id}/watch`);
    expect(del.status).toBe(204);
    expect(await spec.next("error")).toMatchObject({ code: "not_member" });
    expect((await spec.closed).code).toBe(4003);
    expect((await api(s, null, "GET", `/watch/${code}/game`)).status).toBe(404);
    expect((await api(s, ann, "GET", `/games/${g.id}`)).body.watchCode).toBe(
      null,
    );
  });

  it.each(["rotate", "delete"])(
    "a spectator join in flight when the owner revokes (%s) is closed",
    async (how) => {
      const pool = gatedPool();
      const s = await start({}, pool);
      const g = await makeGame([ann]);
      const code = await watchLink(s, ann, g.id);

      const held = pool.hold((sql) => sql.includes("where watch_code = $1"));
      const spec = s.client();
      await spec.send({ t: "join", watch: code, lastSeq: 0 });
      const release = await held;
      const log = vi.spyOn(console, "error");
      try {
        const res =
          how === "rotate"
            ? await api(s, ann, "POST", `/games/${g.id}/watch`)
            : await api(s, ann, "DELETE", `/games/${g.id}/watch`);
        expect(res.status).toBe(how === "rotate" ? 200 : 204);
        release();
        expect((await spec.closed).code).toBe(4003);
        expect(spec.pending().filter((m) => m.t === "joined")).toEqual([]);
        expect(log).not.toHaveBeenCalled();
      } finally {
        log.mockRestore();
      }
    },
  );

  it("an archived or locked game stays watchable, read-only", async () => {
    const s = await start();
    for (const status of ["archived", "locked"]) {
      const g = await makeGame([ann], status);
      const code = await watchLink(s, ann, g.id);
      expect(
        (await api(s, null, "GET", `/watch/${code}/game`)).body.status,
      ).toBe(status);
      const spec = s.client();
      expect((await watch(spec, code)).spectator).toBe(true);
      await spec.next("events");
      await spec.send({ t: "event", seq: 1, event: note("x") });
      expect(await spec.next("error")).toMatchObject({ code: "not_member" });
    }
  });

  it("refuses spectators past MAX_SPECTATORS, players still join", async () => {
    const s = await start({ MAX_SPECTATORS: "2" });
    const g = await makeGame([ann]);
    const code = await watchLink(s, ann, g.id);
    const [x, y, z] = [s.client(), s.client(), s.client()];
    await watch(x, code);
    await watch(y, code);
    await z.send({ t: "join", watch: code, lastSeq: 0 });
    expect(await z.next("error")).toMatchObject({
      code: "too_many_spectators",
    });
    expect((await z.closed).code).toBe(4003);

    const a = s.client();
    expect((await joinPlayer(a, ann, g.id)).presence).toEqual([ann.id]);

    // A seat frees up when a spectator leaves
    await x.close();
    await sleep(50);
    const w = s.client();
    expect((await watch(w, code)).spectator).toBe(true);
  });
});
