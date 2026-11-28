import { createHash, randomBytes } from "node:crypto";
import net from "node:net";

import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";

import { initialState, reduce } from "../../src/play/reduce.js";
import { connect } from "../test/client.js";
import { hasDb, makeTestDb } from "../test/db.js";
import { createServer } from "./app.js";
import { loadConfig } from "./config.js";
import { appendEvent, eventsSince } from "./events.js";

const note = (text) => ({ type: "note.set", text });

describe.skipIf(!hasDb)("hub", () => {
  let db;
  let running = [];

  const configFor = (extra = {}) =>
    loadConfig({
      DATABASE_URL: "x",
      PUBLIC_URL: "http://play.test",
      DISCORD_CLIENT_ID: "cid",
      DISCORD_CLIENT_SECRET: "secret",
      ...extra,
    });

  // A real server on port 0; clients made through it are closed after the test
  const start = async (extra = {}, pool = db.pool) => {
    const server = createServer({ pool, config: configFor(extra) });
    await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
    const url = `ws://127.0.0.1:${server.address().port}/ws`;
    const clients = [];
    const entry = {
      url,
      client: () => {
        const c = connect(url);
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

  // A pool whose next matching call waits: hold(kind) resolves once the call
  // is reached, with a function that lets it continue
  const gatedPool = () => {
    const gates = [];
    const wait = async (kind, sql) => {
      const i = gates.findIndex((g) => g.kind === kind && g.match(sql));
      if (i < 0) return;
      const [gate] = gates.splice(i, 1);
      gate.reached();
      await gate.released;
    };
    return {
      query: async (sql, params) => {
        await wait("query", sql);
        return db.pool.query(sql, params);
      },
      connect: async () => {
        await wait("connect", "");
        return db.pool.connect();
      },
      hold: (kind, match = () => true) => {
        let release;
        const released = new Promise((resolve) => (release = resolve));
        return new Promise((resolve) => {
          gates.push({
            kind,
            match,
            released,
            reached: () => resolve(release),
          });
        });
      },
    };
  };
  const isLastSeq = (sql) => sql.includes("max(seq)");

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
    return { id: rows[0].id, token };
  };

  const makeGame = async (players, status = "active") => {
    const { rows } = await db.pool.query(
      `insert into games (title, owner_id, game_json, invite_code, status)
       values ('t', $1, '{}', $2, $3) returning id`,
      [players[0].id, randomBytes(12).toString("hex"), status],
    );
    for (const p of players) {
      await db.pool.query(
        "insert into seats (game_id, user_id, name) values ($1, $2, 'p')",
        [rows[0].id, p.id],
      );
    }
    return rows[0].id;
  };

  const seed = async (gameId, user, count, config = configFor()) => {
    for (let seq = 1; seq <= count; seq++) {
      await appendEvent(db.pool, config, {
        gameId,
        userId: user.id,
        seq,
        event: note(`n${seq}`),
      });
    }
  };

  const join = async (client, user, gameId, lastSeq = 0) => {
    await client.send({ t: "join", token: user.token, gameId, lastSeq });
    return client.next("joined");
  };

  let ann, bob, cat;

  beforeAll(async () => {
    db = await makeTestDb();
    ann = await makeUser("Ann");
    bob = await makeUser("Bob");
    cat = await makeUser("Cat");
  });

  afterEach(async () => {
    await Promise.all(running.map((r) => r.stop()));
    running = [];
  });

  afterAll(async () => {
    await db.close();
  });

  it("join with a bad token returns bad_token", async () => {
    const s = await start();
    const g = await makeGame([ann]);
    const c = s.client();
    await c.send({ t: "join", token: "nope", gameId: g, lastSeq: 0 });
    expect(await c.next("error")).toMatchObject({ code: "bad_token" });
    expect((await c.closed).code).toBe(4003);
  });

  it("join returns joined and the full history for lastSeq 0", async () => {
    const s = await start();
    const g = await makeGame([ann, bob]);
    await seed(g, ann, 3);
    const c = s.client();
    const joined = await join(c, ann, g);
    expect(joined.seq).toBe(3);
    expect(joined.seats.map((x) => x.userId).sort()).toEqual(
      [ann.id, bob.id].sort(),
    );
    expect(joined.presence).toEqual([ann.id]);
    const { events } = await c.next("events");
    expect(events).toEqual(await eventsSince(db.pool, g, 0));
    expect(events.map((e) => e.seq)).toEqual([1, 2, 3]);
  });

  it("reconnect with lastSeq gets only the missing events", async () => {
    const s = await start();
    const g = await makeGame([ann]);
    await seed(g, ann, 4);
    const c = s.client();
    await join(c, ann, g, 2);
    const { events } = await c.next("events");
    expect(events.map((e) => e.seq)).toEqual([3, 4]);
    expect(events[0]).toEqual({
      seq: 3,
      userId: ann.id,
      type: "note.set",
      text: "n3",
    });
  });

  it("lastSeq ahead of the server gets a snapshot, not an error", async () => {
    const s = await start({ SNAPSHOT_EVERY: "2" });
    const g = await makeGame([ann]);
    await seed(g, ann, 3, configFor({ SNAPSHOT_EVERY: "2" }));
    const c = s.client();
    const joined = await join(c, ann, g, 10);
    expect(joined.seq).toBe(3);
    const snap = await c.next("snapshot");
    expect(snap).toEqual({
      t: "snapshot",
      seq: 0,
      state: initialState(),
      events: await eventsSince(db.pool, g, 0),
    });
    expect(snap.events.map((e) => e.seq)).toEqual([1, 2, 3]);
    expect(c.pending().filter((m) => m.t === "error")).toEqual([]);
  });

  it("lastSeq more than snapshotEvery * 5 behind gets a snapshot", async () => {
    const s = await start({ SNAPSHOT_EVERY: "1" });
    const g = await makeGame([ann]);
    await seed(g, ann, 6, configFor({ SNAPSHOT_EVERY: "1" }));
    const behind = s.client();
    await join(behind, ann, g, 0);
    const snap = await behind.next("snapshot");
    expect(snap.seq).toBe(0);
    expect(snap.events.map((e) => e.seq)).toEqual([1, 2, 3, 4, 5, 6]);
    const close = s.client();
    await join(close, ann, g, 1);
    expect((await close.next("events")).events).toHaveLength(5);
  });

  it("a snapshot frame lets an undo of an event before the stored snapshot reduce", async () => {
    const config = configFor({ SNAPSHOT_EVERY: "2" });
    const s = await start({ SNAPSHOT_EVERY: "2" });
    const g = await makeGame([ann]);
    const append = (seq, event) =>
      appendEvent(db.pool, config, { gameId: g, userId: ann.id, seq, event });
    await append(1, { type: "tile.place", hex: "A1", tile: "7", rotation: 0 });
    await append(2, note("b"));
    await append(3, { type: "undo", target: 1 });
    const c = s.client();
    await join(c, ann, g, 9);
    const snap = await c.next("snapshot");
    const all = await eventsSince(db.pool, g, 0);
    expect(reduce(snap.events, snap.state)).toEqual(reduce(all));
    expect(reduce(snap.events).tiles).toEqual({});
  });

  it("an event committed while a socket joins is not sent twice", async () => {
    const pool = gatedPool();
    const s = await start({}, pool);
    const g = await makeGame([ann, bob]);
    await seed(g, ann, 1);
    const a = s.client();
    await join(a, ann, g, 1);
    const b = s.client();
    const held = pool.hold("query", isLastSeq);
    // bob already holds seq 2 (say from another tab), so the catch-up is empty
    await b.send({ t: "join", token: bob.token, gameId: g, lastSeq: 2 });
    const release = await held;
    await a.send({ t: "event", seq: 2, event: note("during") });
    await a.next("event");
    release();
    expect((await b.next("joined")).seq).toBe(2);
    expect((await b.next("events")).events).toEqual([]);
    await b.send({ t: "event", seq: 3, event: note("after") });
    expect((await b.next("event")).event.seq).toBe(3);
  });

  it("the event that writes a stored snapshot during a join is not sent twice", async () => {
    const config = configFor({ SNAPSHOT_EVERY: "1" });
    const pool = gatedPool();
    const s = await start({ SNAPSHOT_EVERY: "1" }, pool);
    const g = await makeGame([ann, bob]);
    await seed(g, ann, 5, config);
    const a = s.client();
    await join(a, ann, g, 5);
    const b = s.client();
    const held = pool.hold("query", isLastSeq);
    await b.send({ t: "join", token: bob.token, gameId: g, lastSeq: 0 });
    const release = await held;
    await a.send({ t: "event", seq: 6, event: note("snap") });
    await a.next("event");
    release();
    const snap = await b.next("snapshot");
    expect(snap.events.map((e) => e.seq)).toEqual([1, 2, 3, 4, 5, 6]);
    await b.send({ t: "event", seq: 7, event: note("after") });
    expect((await b.next("event")).event.seq).toBe(7);
  });

  it("a socket that joins while the last socket's append is in flight gets its broadcast", async () => {
    const pool = gatedPool();
    const s = await start({}, pool);
    const g = await makeGame([ann, bob]);
    const a = s.client();
    await join(a, ann, g);
    const held = pool.hold("connect");
    await a.send({ t: "event", seq: 1, event: note("in flight") });
    const release = await held;
    await a.close();
    await new Promise((resolve) => setTimeout(resolve, 20));
    const b = s.client();
    // ann has left, so the room is empty while the append is pending
    expect((await join(b, bob, g)).presence).toEqual([bob.id]);
    expect((await b.next("events")).events).toEqual([]);
    release();
    expect((await b.next("event")).event).toMatchObject({
      seq: 1,
      userId: ann.id,
    });
  });

  it("an event is stored and broadcast to all clients in the game, including the sender", async () => {
    const s = await start();
    const g = await makeGame([ann, bob]);
    const a = s.client();
    const b = s.client();
    await join(a, ann, g);
    await join(b, bob, g);
    await a.send({ t: "event", seq: 1, event: note("hi") });
    const expected = { seq: 1, userId: ann.id, type: "note.set", text: "hi" };
    expect((await a.next("event")).event).toEqual(expected);
    expect((await b.next("event")).event).toEqual(expected);
    expect(await eventsSince(db.pool, g, 0)).toEqual([expected]);
  });

  it("clients of another game receive nothing", async () => {
    const s = await start();
    const g = await makeGame([ann]);
    const other = await makeGame([bob]);
    const a = s.client();
    const b = s.client();
    await join(a, ann, g);
    await join(b, bob, other);
    await b.next("events");
    await a.send({ t: "event", seq: 1, event: note("hi") });
    await a.next("event");
    // A round trip on b after a's event proves b had the chance to get it
    await b.send({ t: "event", seq: 1, event: note("own") });
    expect((await b.next("event")).event.text).toBe("own");
    expect(b.pending().filter((m) => m.t === "event")).toEqual([]);
  });

  it("a stale seq gets rebase with the current seq and nobody else sees the event", async () => {
    const s = await start();
    const g = await makeGame([ann, bob]);
    await seed(g, ann, 2);
    const a = s.client();
    const b = s.client();
    await join(a, ann, g, 2);
    await join(b, bob, g, 2);
    await a.send({ t: "event", seq: 2, event: note("late") });
    expect(await a.next("rebase")).toEqual({ t: "rebase", currentSeq: 2 });
    await b.send({ t: "event", seq: 3, event: note("next") });
    expect((await b.next("event")).event.text).toBe("next");
    expect(b.pending().filter((m) => m.t === "event")).toEqual([]);
    expect(await eventsSince(db.pool, g, 2)).toHaveLength(1);
  });

  it("two clients sending the same seq: one event stored, the other gets rebase", async () => {
    const s = await start();
    const g = await makeGame([ann, bob]);
    const a = s.client();
    const b = s.client();
    await join(a, ann, g);
    await join(b, bob, g);
    await Promise.all([
      a.send({ t: "event", seq: 1, event: note("a") }),
      b.send({ t: "event", seq: 1, event: note("b") }),
    ]);
    const winner = (await a.next("event")).event;
    expect((await b.next("event")).event).toEqual(winner);
    const loser = winner.userId === ann.id ? b : a;
    expect(await loser.next("rebase")).toEqual({ t: "rebase", currentSeq: 1 });
    expect(await eventsSince(db.pool, g, 0)).toEqual([winner]);
  });

  it("a non-member's join is refused with not_member and close 4003 and receives no game data", async () => {
    const s = await start();
    const g = await makeGame([ann]);
    await seed(g, ann, 1);
    const a = s.client();
    await join(a, ann, g, 1);
    const c = s.client();
    await c.send({ t: "join", token: cat.token, gameId: g, lastSeq: 0 });
    expect(await c.next("error")).toMatchObject({ code: "not_member" });
    expect((await c.closed).code).toBe(4003);
    expect(c.pending()).toEqual([]);
    // ann saw no presence change for cat
    await a.send({ t: "event", seq: 2, event: note("x") });
    await a.next("event");
    expect(
      a.pending().filter((m) => m.t === "presence" && m.users.length > 1),
    ).toEqual([]);
  });

  it("a player whose seat is removed mid-session gets not_member for events", async () => {
    const s = await start();
    const g = await makeGame([ann, bob]);
    const b = s.client();
    await join(b, bob, g);
    await db.pool.query(
      "delete from seats where game_id = $1 and user_id = $2",
      [g, bob.id],
    );
    await b.send({ t: "event", seq: 1, event: note("x") });
    expect(await b.next("error")).toMatchObject({ code: "not_member" });
    expect(await eventsSince(db.pool, g, 0)).toEqual([]);
  });

  it("a locked game rejects events", async () => {
    const s = await start();
    const g = await makeGame([ann], "locked");
    const c = s.client();
    await join(c, ann, g);
    await c.send({ t: "event", seq: 1, event: note("x") });
    expect(await c.next("error")).toMatchObject({ code: "locked" });
  });

  it("an archived game rejects events", async () => {
    const s = await start();
    const g = await makeGame([ann], "archived");
    const c = s.client();
    await join(c, ann, g);
    await c.send({ t: "event", seq: 1, event: note("x") });
    expect(await c.next("error")).toMatchObject({ code: "locked" });
    expect(await eventsSince(db.pool, g, 0)).toEqual([]);
  });

  it("a second join frame on a joined socket is refused", async () => {
    const s = await start();
    const g = await makeGame([ann]);
    const c = s.client();
    await join(c, ann, g);
    await c.send({ t: "join", token: ann.token, gameId: g, lastSeq: 0 });
    expect(await c.next("error")).toEqual({
      t: "error",
      code: "invalid",
      message: "already joined",
    });
  });

  it("a game deleted mid-session answers events with an error", async () => {
    const s = await start();
    const g = await makeGame([ann]);
    const c = s.client();
    await join(c, ann, g);
    await db.pool.query("delete from games where id = $1", [g]);
    await c.send({ t: "event", seq: 1, event: note("x") });
    expect(await c.next("error")).toMatchObject({ code: "not_member" });
  });

  it("an invalid event gets invalid with a message", async () => {
    const s = await start();
    const g = await makeGame([ann]);
    const c = s.client();
    await join(c, ann, g);
    await c.send({ t: "event", seq: 1, event: { type: "tile.place" } });
    const err = await c.next("error");
    expect(err.code).toBe("invalid");
    expect(err.message).toBeTruthy();
    await c.send({ t: "event", seq: 2 ** 40, event: note("x") });
    expect(await c.next("error")).toMatchObject({ code: "invalid" });
  });

  it("presence updates on join and close", async () => {
    const s = await start();
    const g = await makeGame([ann, bob]);
    const a = s.client();
    await join(a, ann, g);
    expect((await a.next("presence")).users).toEqual([ann.id]);
    const b = s.client();
    const joined = await join(b, bob, g);
    expect(joined.presence.sort()).toEqual([ann.id, bob.id].sort());
    expect((await a.next("presence")).users.sort()).toEqual(
      [ann.id, bob.id].sort(),
    );
    await b.close();
    expect((await a.next("presence")).users).toEqual([ann.id]);
  });

  it("a socket that never joins is closed with 4001", async () => {
    const s = await start({ JOIN_TIMEOUT_MS: "50" });
    const c = s.client();
    await c.opened;
    expect((await c.closed).code).toBe(4001);
  });

  it("a joined socket is not closed by the join timeout", async () => {
    const s = await start({ JOIN_TIMEOUT_MS: "50" });
    const g = await makeGame([ann]);
    const c = s.client();
    await join(c, ann, g);
    await new Promise((resolve) => setTimeout(resolve, 120));
    await c.send({ t: "event", seq: 1, event: note("x") });
    expect((await c.next("event")).event.seq).toBe(1);
  });

  it("rate limit drops frames over the limit", async () => {
    const s = await start({ MAX_EVENTS_PER_SECOND: "2" });
    const g = await makeGame([ann]);
    const c = s.client();
    await join(c, ann, g);
    for (let seq = 1; seq <= 4; seq++) {
      await c.send({ t: "event", seq, event: note(`n${seq}`) });
    }
    expect(await c.next("error")).toMatchObject({ code: "rate_limited" });
    expect(await c.next("error")).toMatchObject({ code: "rate_limited" });
    await c.next("event");
    await c.next("event");
    expect(await eventsSince(db.pool, g, 0)).toHaveLength(2);
  });

  it("malformed frames get invalid and keep the socket open", async () => {
    const s = await start();
    const g = await makeGame([ann]);
    const c = s.client();
    for (const frame of [
      "not json",
      "[]",
      "null",
      JSON.stringify({ t: "nope" }),
      JSON.stringify({ t: "event", seq: 1, event: note("x") }),
      JSON.stringify({ t: "join", token: 5, gameId: g, lastSeq: 0 }),
      JSON.stringify({ t: "join", token: ann.token, gameId: "x", lastSeq: 0 }),
      JSON.stringify({ t: "join", token: ann.token, gameId: g, lastSeq: -1 }),
    ]) {
      await c.send(frame);
      expect(await c.next("error")).toMatchObject({ code: "invalid" });
    }
    await join(c, ann, g);
    await c.send({ t: "join", token: ann.token, gameId: g, lastSeq: 0 });
    expect(await c.next("error")).toMatchObject({ code: "invalid" });
  });

  it("an unknown game is refused", async () => {
    const s = await start();
    const c = s.client();
    await c.send({
      t: "join",
      token: ann.token,
      gameId: "00000000-0000-0000-0000-000000000000",
      lastSeq: 0,
    });
    expect(await c.next("error")).toMatchObject({ code: "not_member" });
    expect((await c.closed).code).toBe(4003);
  });

  it("an oversize frame closes the socket", async () => {
    const s = await start();
    const c = s.client();
    await c.send("x".repeat(300 * 1024));
    expect((await c.closed).code).toBe(1009);
  });

  it("other paths are not upgraded", async () => {
    const s = await start();
    const c = connect(s.url.replace("/ws", "/other"));
    await expect(c.opened).rejects.toThrow();
    await c.closed;
  });

  it("survives a client that resets an upgrade to another path", async () => {
    const s = await start();
    const port = new URL(s.url).port;
    for (let i = 0; i < 20; i++) {
      const socket = net.connect(Number(port), "127.0.0.1");
      socket.on("error", () => {});
      await new Promise((resolve) => socket.on("connect", resolve));
      socket.write(
        "GET /nope HTTP/1.1\r\nHost: x\r\nConnection: Upgrade\r\nUpgrade: websocket\r\n\r\n",
      );
      socket.resetAndDestroy();
    }
    await new Promise((resolve) => setTimeout(resolve, 200));
    const res = await fetch(`http://127.0.0.1:${port}/health`);
    expect(res.status).toBe(200);
  });
});
