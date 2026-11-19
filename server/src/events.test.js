import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { initialState, reduce } from "../../src/play/reduce.js";
import { hasDb, makeTestDb } from "../test/db.js";
import { loadConfig } from "./config.js";
import { appendEvent, eventsSince, lastSeq, loadSnapshot } from "./events.js";

const config = loadConfig({
  DATABASE_URL: "x",
  PUBLIC_URL: "http://play.test",
  DISCORD_CLIENT_ID: "cid",
  DISCORD_CLIENT_SECRET: "secret",
  SNAPSHOT_EVERY: "3",
});

const note = (text) => ({ type: "note.set", text });

describe.skipIf(!hasDb)("events", () => {
  let db, userId, outsiderId;

  const makeGame = async (status = "active") => {
    const { rows } = await db.pool.query(
      `insert into games (title, owner_id, game_json, invite_code, status)
       values ('t', $1, '{}', $2, $3) returning id`,
      [userId, Math.random().toString(36).slice(2), status],
    );
    await db.pool.query(
      "insert into seats (game_id, user_id, name) values ($1, $2, 'a')",
      [rows[0].id, userId],
    );
    return rows[0].id;
  };

  const append = (gameId, seq, event, uid = userId) =>
    appendEvent(db.pool, config, { gameId, userId: uid, seq, event });

  beforeAll(async () => {
    db = await makeTestDb();
    const mk = async (d) =>
      (
        await db.pool.query(
          "insert into users (discord_id, name) values ($1, $1) returning id",
          [d],
        )
      ).rows[0].id;
    userId = await mk("u1");
    outsiderId = await mk("u2");
  });
  afterAll(async () => {
    await db.close();
  });

  it("appends events with consecutive seq", async () => {
    const g = await makeGame();
    expect(await lastSeq(db.pool, g)).toBe(0);
    expect(await append(g, 1, note("a"))).toEqual({ ok: true, seq: 1 });
    expect(await append(g, 2, note("b"))).toEqual({ ok: true, seq: 2 });
    expect(await lastSeq(db.pool, g)).toBe(2);
  });

  it("rejects a non member", async () => {
    const g = await makeGame();
    const r = await append(g, 1, note("a"), outsiderId);
    expect(r).toMatchObject({ ok: false, reason: "not_member" });
  });

  it("rejects writes to a locked game", async () => {
    const g = await makeGame("locked");
    const r = await append(g, 1, note("a"));
    expect(r).toMatchObject({ ok: false, reason: "locked" });
  });

  it("rejects an invalid event with a message", async () => {
    const g = await makeGame();
    const r = await append(g, 1, { type: "tile.place" });
    expect(r).toMatchObject({ ok: false, reason: "invalid" });
    expect(r.message).toBeTruthy();
  });

  it("rejects seq that is not last plus one with conflict and the current seq", async () => {
    const g = await makeGame();
    await append(g, 1, note("a"));
    expect(await append(g, 1, note("b"))).toMatchObject({
      ok: false,
      reason: "conflict",
      currentSeq: 1,
    });
    expect(await append(g, 3, note("b"))).toMatchObject({
      ok: false,
      reason: "conflict",
      currentSeq: 1,
    });
  });

  it("two concurrent appends for the same seq store exactly one and report conflict for the other", async () => {
    const g = await makeGame();
    const rs = await Promise.all([
      append(g, 1, note("a")),
      append(g, 1, note("b")),
    ]);
    expect(rs.filter((r) => r.ok)).toHaveLength(1);
    const lost = rs.find((r) => !r.ok);
    expect(lost).toMatchObject({ reason: "conflict", currentSeq: 1 });
    expect(await eventsSince(db.pool, g, 0)).toHaveLength(1);
  });

  it("undo must target an earlier existing seq", async () => {
    const g = await makeGame();
    await append(g, 1, note("a"));
    expect(await append(g, 2, { type: "undo", target: 2 })).toMatchObject({
      ok: false,
      reason: "invalid",
    });
    expect(await append(g, 2, { type: "undo", target: 9 })).toMatchObject({
      ok: false,
      reason: "invalid",
    });
    expect(await append(g, 2, { type: "undo", target: 1 })).toEqual({
      ok: true,
      seq: 2,
    });
  });

  it("eventsSince returns only later events in order", async () => {
    const g = await makeGame();
    await append(g, 1, note("a"));
    await append(g, 2, note("b"));
    await append(g, 3, { type: "tile.rotate", hex: "A1", rotation: 2 });
    expect(await eventsSince(db.pool, g, 1)).toEqual([
      { seq: 2, userId, type: "note.set", text: "b" },
      { seq: 3, userId, type: "tile.rotate", hex: "A1", rotation: 2 },
    ]);
  });

  it("loadSnapshot returns null before the first snapshot", async () => {
    const g = await makeGame();
    await append(g, 1, note("a"));
    await append(g, 2, note("b"));
    expect(await loadSnapshot(db.pool, g)).toBeNull();
  });

  it("a snapshot is written every snapshotEvery events and equals reduce of the log", async () => {
    const g = await makeGame();
    await append(g, 1, note("a"));
    await append(g, 2, {
      type: "tile.place",
      hex: "A1",
      tile: "7",
      rotation: 1,
    });
    await append(g, 3, note("c"));
    const snap = await loadSnapshot(db.pool, g);
    expect(snap.seq).toBe(3);
    const log = await eventsSince(db.pool, g, 0);
    expect(snap.state).toEqual(reduce(log));
    expect(snap.state).not.toEqual(initialState());
    await append(g, 4, note("d"));
    expect((await loadSnapshot(db.pool, g)).seq).toBe(3);
  });
});
