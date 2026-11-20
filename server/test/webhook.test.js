import { createHash, randomBytes } from "node:crypto";

import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

import { createServer } from "../src/app.js";
import { loadConfig } from "../src/config.js";
import { connect } from "./client.js";
import { hasDb, makeTestDb } from "./db.js";
import { startFakeDiscord } from "./discord.js";

const BATCH_MS = 300;

describe.skipIf(!hasDb)("discord webhook notices", () => {
  let db, discord, server, base, wsUrl;
  const clients = [];
  // Every response body the tests saw, checked for webhook tokens at the end
  const bodies = [];
  const tokens = [];

  const hookUrl = (token) => {
    tokens.push(token);
    return `${discord.url}/api/webhooks/42/${token}`;
  };
  const postsTo = (token) => discord.posts.filter((p) => p.token === token);
  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

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

  const makeGame = async (players) => {
    const { rows } = await db.pool.query(
      `insert into games (title, owner_id, game_json, invite_code)
       values ('t', $1, '{}', $2) returning id`,
      [players[0].id, randomBytes(12).toString("hex")],
    );
    for (const p of players) {
      await db.pool.query(
        "insert into seats (game_id, user_id, name) values ($1, $2, $3)",
        [rows[0].id, p.id, p.name],
      );
    }
    return rows[0].id;
  };

  const api = async (user, method, path, body) => {
    const res = await fetch(`${base}${path}`, {
      method,
      headers: {
        authorization: `Bearer ${user.token}`,
        ...(body === undefined ? {} : { "content-type": "application/json" }),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    const text = await res.text();
    bodies.push(text);
    return { status: res.status, body: text ? JSON.parse(text) : null };
  };
  const setHook = (user, id, webhookUrl) =>
    api(user, "PATCH", `/games/${id}`, { webhookUrl });

  const join = async (user, gameId) => {
    const c = connect(wsUrl);
    clients.push(c);
    await c.send({ t: "join", token: user.token, gameId, lastSeq: 0 });
    await c.next("joined");
    await c.next("events");
    return c;
  };

  const place = (c, seq, hex = "A1") =>
    c.send({
      t: "event",
      seq,
      event: { type: "tile.place", hex, tile: "7", rotation: 0 },
    });

  let alice, bob;

  beforeAll(async () => {
    db = await makeTestDb();
    discord = await startFakeDiscord();
    const config = loadConfig({
      DATABASE_URL: "x",
      PUBLIC_URL: "http://play.test",
      DISCORD_CLIENT_ID: "cid",
      DISCORD_CLIENT_SECRET: "secret",
      DISCORD_WEBHOOK_ORIGIN: discord.url,
      WEBHOOK_BATCH_MS: String(BATCH_MS),
    });
    server = createServer({ pool: db.pool, config });
    await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
    const { port } = server.address();
    base = `http://127.0.0.1:${port}`;
    wsUrl = `ws://127.0.0.1:${port}/ws`;
    alice = await makeUser("Alice");
    bob = await makeUser("Bob");
  });

  afterAll(async () => {
    await Promise.all(clients.map((c) => c.close()));
    if (server) await new Promise((resolve) => server.close(resolve));
    await discord?.close();
    await db?.close();
  });

  it("the owner sets a webhook; two moves become one post with two lines", async () => {
    const id = await makeGame([alice, bob]);
    const set = await setHook(alice, id, hookUrl("first-hook"));
    expect(set).toEqual({
      status: 200,
      body: { id, status: "active", webhookSet: true },
    });
    expect(postsTo("first-hook").map((p) => p.body)).toEqual([
      { content: "Notifications connected", allowed_mentions: { parse: [] } },
    ]);

    const owner = await api(alice, "GET", `/games/${id}`);
    expect(owner.body.webhookSet).toBe(true);
    const guest = await api(bob, "GET", `/games/${id}`);
    expect("webhookSet" in guest.body).toBe(false);
    await api(alice, "GET", "/games");

    const a = await join(alice, id);
    const b = await join(bob, id);
    await place(a, 1);
    await a.next("event");
    await b.next("event");
    await b.send({
      t: "event",
      seq: 2,
      event: { type: "note.set", text: "@everyone secret plan" },
    });
    await a.next("event");

    await vi.waitFor(() => expect(postsTo("first-hook")).toHaveLength(2), {
      timeout: 3000,
    });
    expect(postsTo("first-hook")[1].body).toEqual({
      content: "Alice placed tile 7 on A1\nBob updated the notes",
      allowed_mentions: { parse: [] },
    });
    await sleep(BATCH_MS * 2);
    expect(postsTo("first-hook")).toHaveLength(2);
  });

  it("refuses a non-owner (403) and an invalid URL (400) without storing it", async () => {
    const id = await makeGame([alice, bob]);
    expect((await setHook(bob, id, hookUrl("bobs-hook"))).status).toBe(403);
    for (const bad of [
      // The real Discord host is not the configured origin here
      "https://discord.com/api/webhooks/1/real-token",
      `${discord.url}/api/webhooks/abc/not-an-id`,
      `${discord.url}/api/webhooks/1/tok?wait=true`,
      "https://evil.test/api/webhooks/1/evil-token",
      42,
    ]) {
      if (typeof bad === "string") tokens.push(bad);
      const res = await setHook(alice, id, bad);
      expect(res).toEqual({
        status: 400,
        body: { error: "Invalid webhook URL" },
      });
    }
    expect(postsTo("bobs-hook")).toHaveLength(0);
    expect((await api(alice, "GET", `/games/${id}`)).body.webhookSet).toBe(
      false,
    );
  });

  it("stops posting once the owner clears the webhook", async () => {
    const id = await makeGame([alice, bob]);
    await setHook(alice, id, hookUrl("cleared-hook"));
    const cleared = await setHook(alice, id, null);
    expect(cleared.body).toEqual({ id, status: "active", webhookSet: false });

    const a = await join(alice, id);
    await place(a, 1);
    await a.next("event");
    await sleep(BATCH_MS * 3);
    expect(postsTo("cleared-hook")).toHaveLength(1);
  });

  it("a slow webhook does not delay events to the other player", async () => {
    const id = await makeGame([alice, bob]);
    await setHook(alice, id, hookUrl("slow-hook"));
    discord.setWebhook("slow-hook", { delayMs: 2000 });
    const a = await join(alice, id);
    const b = await join(bob, id);
    await place(a, 1);
    await b.next("event");
    // The notice of move 1 is now waiting on the webhook
    await vi.waitFor(() => expect(postsTo("slow-hook")).toHaveLength(2), {
      timeout: 3000,
    });

    const sent = Date.now();
    await place(a, 2, "B2");
    const frame = await b.next("event");
    expect(frame.event.seq).toBe(2);
    expect(Date.now() - sent).toBeLessThan(1000);
  });

  it("a deleted webhook (404) is refused when set and switches notices off later", async () => {
    const id = await makeGame([alice, bob]);
    discord.setWebhook("deleted-hook", { status: 404 });
    const refused = await setHook(alice, id, hookUrl("deleted-hook"));
    expect(refused).toEqual({
      status: 400,
      body: { error: "Discord rejected the webhook" },
    });
    expect((await api(alice, "GET", `/games/${id}`)).body.webhookSet).toBe(
      false,
    );

    await setHook(alice, id, hookUrl("later-deleted"));
    discord.setWebhook("later-deleted", { status: 404 });
    const a = await join(alice, id);
    await place(a, 1);
    await a.next("event");
    await vi.waitFor(
      async () =>
        expect((await api(alice, "GET", `/games/${id}`)).body.webhookSet).toBe(
          false,
        ),
      { timeout: 3000, interval: 100 },
    );
    expect(postsTo("later-deleted")).toHaveLength(2);

    await place(a, 2);
    await a.next("event");
    await sleep(BATCH_MS * 3);
    expect(postsTo("later-deleted")).toHaveLength(2);
  });

  it("a webhook that fails (500) keeps the game going and the webhook set", async () => {
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    try {
      const id = await makeGame([alice, bob]);
      await setHook(alice, id, hookUrl("broken-hook"));
      discord.setWebhook("broken-hook", { status: 500 });
      const a = await join(alice, id);
      await place(a, 1);
      await a.next("event");
      await vi.waitFor(() => expect(postsTo("broken-hook")).toHaveLength(2), {
        timeout: 3000,
      });
      await place(a, 2);
      expect((await a.next("event")).event.seq).toBe(2);
      expect((await api(alice, "GET", `/games/${id}`)).body.webhookSet).toBe(
        true,
      );
      for (const call of log.mock.calls) {
        expect(call.join(" ")).not.toContain("broken-hook");
      }
    } finally {
      log.mockRestore();
    }
  });

  // Runs last: every response of the tests above
  it("never returns a webhook URL, to the owner or in an error", () => {
    expect(bodies.length).toBeGreaterThan(20);
    for (const token of tokens) {
      for (const text of bodies) expect(text).not.toContain(token);
    }
  });
});
