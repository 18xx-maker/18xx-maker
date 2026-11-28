import { readFileSync } from "node:fs";

import { afterAll, beforeAll, describe, expect, it } from "vitest";
import WebSocket from "ws";

import { createApi } from "../../src/play/client/api.js";
import { createGameBody } from "../../src/play/client/createGame.js";
import { createSession } from "../../src/play/client/socket.js";
import { createServer } from "../src/app.js";
import { loadConfig } from "../src/config.js";
import { hasDb, makeTestDb } from "./db.js";
import { startFakeDiscord } from "./discord.js";

// The game as the app holds it: the file of 18Test plus the app's meta
const game = {
  meta: { id: "18Test", slug: "18Test", type: "bundled" },
  ...JSON.parse(
    readFileSync(new URL("../../src/data/games/18Test.json", import.meta.url)),
  ),
};

const ORIGIN = "http://app.test";
const GUILD = "guild-1";
const TIMEOUT = 5000;

// Every frame the server sent to a client socket
const received = [];
class RecordingWebSocket extends WebSocket {
  constructor(...args) {
    super(...args);
    this.on("message", (data) => received.push(JSON.parse(data.toString())));
  }
}

// Resolves with the first view of the session that passes check
const until = (session, check, what = "a view") =>
  new Promise((resolve, reject) => {
    let last;
    let stop = () => {};
    const timer = setTimeout(() => {
      stop();
      reject(
        new Error(`timed out waiting for ${what}: ${JSON.stringify(last)}`),
      );
    }, TIMEOUT);
    stop = session.subscribe((view) => {
      last = view;
      if (!check(view)) return;
      clearTimeout(timer);
      queueMicrotask(() => stop());
      resolve(view);
    });
  });

const types = (view) => view.log.map((e) => `${e.seq}:${e.type}`);

// The client libraries of the app (api, socket and the create body of
// CreateGame) against the real server
describe.skipIf(!hasDb)("play client against the real server", () => {
  let db;
  let discord;
  let server;
  let base;
  const sessions = [];

  // The redirect flow from the client's login url: the (fake) Discord sends
  // the browser to the callback, which sends it back with #token=
  const login = async (code) => {
    const start = await fetch(createApi({ baseUrl: base }).loginUrl(ORIGIN), {
      redirect: "manual",
    });
    expect(start.status).toBe(302);
    const authorize = new URL(start.headers.get("location"));
    const callback = new URL(authorize.searchParams.get("redirect_uri"));
    callback.searchParams.set("code", code);
    callback.searchParams.set("state", authorize.searchParams.get("state"));
    const done = await fetch(`${base}${callback.pathname}${callback.search}`, {
      redirect: "manual",
    });
    const location = new URL(done.headers.get("location"));
    expect(location.origin).toBe(ORIGIN);
    return /^#token=(.+)$/.exec(location.hash)[1];
  };

  const open = (token, gameId, userId) => {
    const session = createSession({
      baseUrl: base,
      token,
      gameId,
      userId,
      WebSocket: RecordingWebSocket,
    });
    sessions.push(session);
    return session;
  };

  beforeAll(async () => {
    db = await makeTestDb();
    discord = await startFakeDiscord({
      users: [
        { code: "a", id: "1", username: "Alice", guilds: [GUILD] },
        { code: "b", id: "2", username: "Bob", guilds: [GUILD] },
      ],
    });
    const config = loadConfig({
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
    base = `http://127.0.0.1:${server.address().port}`;
    config.publicUrl = base;
  });

  afterAll(async () => {
    for (const session of sessions) session.close();
    if (server) {
      server.closeAllConnections?.();
      await new Promise((resolve) => server.close(resolve));
    }
    if (discord) await discord.close();
    if (db) await db.close();
  });

  it("creates, joins, plays, undoes, rebases and locks a game", async () => {
    const tokenA = await login("a");
    const tokenB = await login("b");
    const apiA = createApi({ baseUrl: base, token: tokenA });
    const apiB = createApi({ baseUrl: base, token: tokenB });
    const alice = await apiA.me();
    const bob = await apiB.me();

    // The body CreateGame posts for the game on screen
    const created = await apiA.createGame(
      createGameBody({ game, config: {}, seatName: "Alice" }),
    );
    expect((await apiA.getGame(created.id)).game).not.toHaveProperty("meta");
    await apiB.join(created.inviteCode, { name: "Bob" });

    const a = open(tokenA, created.id, alice.id);
    const b = open(tokenB, created.id, bob.id);
    await until(a, (v) => v.status === "online" && v.seats.length === 2);
    await until(b, (v) => v.status === "online");

    // A places a tile, B gets it
    a.send({ type: "tile.place", hex: "A11", tile: "1", rotation: 2 });
    const seen = await until(b, (v) => v.log.length === 1, "B to get the tile");
    expect(seen.log[0]).toMatchObject({
      seq: 1,
      userId: alice.id,
      type: "tile.place",
      hex: "A11",
    });

    // B undoes it, A gets the undo
    b.send({ type: "undo", target: 1 });
    await until(a, (v) => v.log.length === 2, "A to get the undo");
    expect(types(await until(a, (v) => v.pending === 0))).toEqual([
      "1:tile.place",
      "2:undo",
    ]);

    // Both send at seq 3: the loser is told to rebase, catches up and sends
    // its event again at seq 4
    await until(b, (v) => v.log.length === 2);
    const rebases = received.filter((m) => m.t === "rebase").length;
    a.send({ type: "note.set", text: "from a" });
    b.send({ type: "note.set", text: "from b" });
    const done = (v) => v.log.length === 4 && v.pending === 0;
    const [va, vb] = await Promise.all([until(a, done), until(b, done)]);
    expect(va.log).toEqual(vb.log);
    expect(
      va.log
        .slice(2)
        .map((e) => e.text)
        .sort(),
    ).toEqual(["from a", "from b"]);
    expect(received.filter((m) => m.t === "rebase").length).toBe(rebases + 1);

    // The owner locks the game: a move is refused with locked
    await apiA.setStatus(created.id, "locked");
    b.send({ type: "note.set", text: "too late" });
    const locked = await until(b, (v) => v.status === "locked", "locked");
    expect(locked.error).toBe("locked");
    expect(locked.pending).toBe(0);

    // Unlocked again, a new session plays on
    await apiA.setStatus(created.id, "active");
    const b2 = open(tokenB, created.id, bob.id);
    await until(b2, (v) => v.status === "online" && v.log.length === 4);
    b2.send({ type: "note.set", text: "again" });
    await until(a, (v) => v.log.length === 5, "A to get the new move");
    expect((await until(b2, (v) => v.pending === 0)).log.at(-1)).toMatchObject({
      seq: 5,
      userId: bob.id,
      text: "again",
    });
  });
});
