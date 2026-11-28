import { readFileSync } from "node:fs";

import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { initialState, reduce } from "../../src/play/reduce.js";
import { createServer } from "../src/app.js";
import { loadConfig } from "../src/config.js";
import { connect } from "./client.js";
import { hasDb, makeTestDb } from "./db.js";
import { startFakeDiscord } from "./discord.js";

const game = JSON.parse(
  readFileSync(new URL("../../src/data/games/18Test.json", import.meta.url)),
);

const ORIGIN = "http://app.test";
const GUILD = "guild-1";

describe.skipIf(!hasDb)("two player end to end", () => {
  let db;
  let discord;
  let server;
  let base;
  let wsUrl;
  let config;
  const clients = [];

  const open = () => {
    const c = connect(wsUrl);
    clients.push(c);
    return c;
  };

  // The real redirect flow: login, the (fake) Discord authorize step, callback
  const login = async (code) => {
    const nonce = `n${code}`.padEnd(22, "x");
    const start = await fetch(
      `${base}/auth/discord/login?return=${encodeURIComponent(ORIGIN)}&nonce=${nonce}`,
      { redirect: "manual" },
    );
    expect(start.status).toBe(302);
    const authorize = new URL(start.headers.get("location"));
    expect(authorize.href.startsWith(`${config.discord.authBase}/`)).toBe(true);

    // The fake Discord has no consent page: the user approving sends the
    // browser back to the redirect_uri with a code and the state
    const callback = new URL(authorize.searchParams.get("redirect_uri"));
    callback.searchParams.set("code", code);
    callback.searchParams.set("state", authorize.searchParams.get("state"));
    const done = await fetch(`${base}${callback.pathname}${callback.search}`, {
      redirect: "manual",
    });
    expect(done.status).toBe(302);
    const location = new URL(done.headers.get("location"));
    expect(location.origin).toBe(ORIGIN);
    const fragment = new URLSearchParams(location.hash.slice(1));
    expect(fragment.get("nonce")).toBe(nonce);
    const token = fragment.get("token");
    expect(token).toBeTruthy();
    return token;
  };

  const api = (token, path, body) =>
    fetch(`${base}${path}`, {
      method: "POST",
      headers: {
        authorization: `Bearer ${token}`,
        "content-type": "application/json",
      },
      body: JSON.stringify(body ?? {}),
    });

  // A client's local mirror: the full log, reduced on demand
  const mirror = (joined) => {
    const log = [];
    const apply = (frame) => {
      if (frame.t === "snapshot") {
        expect(frame.state).toEqual(initialState());
        log.length = 0;
        log.push(...frame.events);
      } else if (frame.t === "events") log.push(...frame.events);
      else if (frame.t === "event") log.push(frame.event);
    };
    apply(joined);
    return {
      apply,
      log,
      state: () => reduce(log),
      seq: () => log.reduce((m, e) => Math.max(m, e.seq), 0),
    };
  };

  beforeAll(async () => {
    db = await makeTestDb();
    discord = await startFakeDiscord({
      users: [
        { code: "a", id: "1", username: "Alice", guilds: [GUILD] },
        { code: "b", id: "2", username: "Bob", guilds: [GUILD] },
        { code: "c", id: "3", username: "Carol", guilds: [GUILD] },
      ],
    });
    config = loadConfig({
      DATABASE_URL: "x",
      PUBLIC_URL: "http://play.test",
      ALLOWED_ORIGINS: ORIGIN,
      DISCORD_CLIENT_ID: "cid",
      DISCORD_CLIENT_SECRET: "secret",
      DISCORD_GUILD_ID: GUILD,
      DISCORD_API_BASE: discord.url,
      DISCORD_AUTH_BASE: `${discord.url}/authorize-base`,
    });
    server = createServer({ pool: db.pool, config });
    await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
    const { port } = server.address();
    base = `http://127.0.0.1:${port}`;
    wsUrl = `ws://127.0.0.1:${port}/ws`;
    // The callback URL Discord is told about points at PUBLIC_URL
    config.publicUrl = base;
  });

  afterAll(async () => {
    await Promise.all(clients.map((c) => c.close()));
    if (server) await new Promise((resolve) => server.close(resolve));
    if (discord) await discord.close();
    if (db) await db.close();
  });

  it("two players play a short game through the real server", async () => {
    const tokenA = await login("a");
    const tokenB = await login("b");
    const tokenC = await login("c");

    const created = await api(tokenA, "/games", { game });
    expect(created.status).toBe(201);
    const { id: gameId, inviteCode } = await created.json();

    const joinedSeat = await api(tokenB, `/invites/${inviteCode}/join`, {
      name: "Bob",
    });
    expect(joinedSeat.status).toBe(200);

    const a = open();
    const b = open();
    await a.send({ t: "join", token: tokenA, gameId, lastSeq: 0 });
    await b.send({ t: "join", token: tokenB, gameId, lastSeq: 0 });
    const aJoined = await a.next("joined");
    const bJoined = await b.next("joined");
    expect(aJoined.seats).toHaveLength(2);
    expect(bJoined.seq).toBe(0);
    const ma = mirror(await a.next("events"));
    const mb = mirror(await b.next("events"));

    // A places a tile, B sees it
    await a.send({
      t: "event",
      seq: 1,
      event: { type: "tile.place", hex: "A11", tile: "1", rotation: 2 },
    });
    const aSees1 = await a.next("event");
    const bSees1 = await b.next("event");
    expect(bSees1.event).toMatchObject({
      seq: 1,
      type: "tile.place",
      hex: "A11",
      tile: "1",
      rotation: 2,
    });
    ma.apply(aSees1);
    mb.apply(bSees1);

    // B places a token, A sees it
    await b.send({
      t: "event",
      seq: 2,
      event: { type: "token.place", hex: "A11", token: "BLRR", x: 0, y: 0 },
    });
    const bSees2 = await b.next("event");
    const aSees2 = await a.next("event");
    expect(aSees2.event).toMatchObject({ seq: 2, type: "token.place" });
    ma.apply(aSees2);
    mb.apply(bSees2);
    expect(ma.state().tokens.A11).toHaveLength(1);

    // A undoes B's move while both are connected: both receive it live
    await a.send({ t: "event", seq: 3, event: { type: "undo", target: 2 } });
    const aSees3 = await a.next("event");
    const bSees3 = await b.next("event");
    expect(bSees3.event).toMatchObject({ seq: 3, type: "undo", target: 2 });
    ma.apply(aSees3);
    mb.apply(bSees3);
    expect(ma.state().tokens.A11).toBeUndefined();
    expect(mb.state().tokens.A11).toBeUndefined();

    // B drops off; A makes one more move meanwhile
    await b.close();
    await a.send({
      t: "event",
      seq: 4,
      event: { type: "note.set", text: "hi" },
    });
    ma.apply(await a.next("event"));

    // B reconnects with its old lastSeq and gets only what it missed
    const b2 = open();
    await b2.send({ t: "join", token: tokenB, gameId, lastSeq: mb.seq() });
    await b2.next("joined");
    const caught = await b2.next("events");
    expect(caught.events.map((e) => e.seq)).toEqual([4]);
    mb.apply(caught);

    // Every end agrees with the server's log
    const full = await (async () => {
      const c = open();
      await c.send({ t: "join", token: tokenA, gameId, lastSeq: 0 });
      await c.next("joined");
      return (await c.next("events")).events;
    })();
    expect(full.map((e) => e.seq)).toEqual([1, 2, 3, 4]);
    // No duplicated or reordered broadcast reached either mirror
    expect(ma.log.map((e) => e.seq)).toEqual([1, 2, 3, 4]);
    expect(mb.log.map((e) => e.seq)).toEqual([1, 2, 3, 4]);
    // Nothing but presence is left unread on any socket
    for (const c of [a, b, b2]) {
      expect(c.pending().filter((m) => m.t !== "presence")).toEqual([]);
    }
    expect(ma.state()).toEqual(reduce(full));
    expect(mb.state()).toEqual(reduce(full));
    expect(mb.state()).toEqual(ma.state());
    expect(mb.state().tiles.A11).toEqual({ tile: "1", rotation: 2 });
    expect(mb.state().notes).toBe("hi");

    // A user who never joined the game is refused and gets no game data
    const outsider = open();
    await outsider.send({ t: "join", token: tokenC, gameId, lastSeq: 0 });
    const refused = await outsider.next("error");
    expect(refused.code).toBe("not_member");
    expect((await outsider.closed).code).toBe(4003);
    expect(outsider.pending().map((m) => m.t)).toEqual([]);
  });
});
