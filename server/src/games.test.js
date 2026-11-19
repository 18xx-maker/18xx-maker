import { createHash, randomBytes } from "node:crypto";
import { readFileSync } from "node:fs";

import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { hasDb, makeTestDb } from "../test/db.js";
import { createApp } from "./app.js";
import { loadConfig } from "./config.js";

const game = JSON.parse(
  readFileSync(new URL("../../src/data/games/18Test.json", import.meta.url)),
);

describe.skipIf(!hasDb)("games", () => {
  let db, app;

  const makeApp = (extra = {}) =>
    createApp({
      pool: db.pool,
      config: loadConfig({
        DATABASE_URL: "x",
        PUBLIC_URL: "http://play.test",
        DISCORD_CLIENT_ID: "cid",
        DISCORD_CLIENT_SECRET: "secret",
        ...extra,
      }),
    });

  const makeUser = async (name, canCreate = true) => {
    const token = randomBytes(16).toString("hex");
    const { rows } = await db.pool.query(
      "insert into users (discord_id, name, can_create) values ($1, $2, $3) returning id",
      [randomBytes(8).toString("hex"), name, canCreate],
    );
    await db.pool.query(
      "insert into sessions (token_hash, user_id) values ($1, $2)",
      [createHash("sha256").update(token).digest("hex"), rows[0].id],
    );
    return { id: rows[0].id, token };
  };

  const call = (user, method, path, body, theApp = app, headers = {}) =>
    theApp.request(path, {
      method,
      headers: {
        ...(user ? { authorization: `Bearer ${user.token}` } : {}),
        ...(body !== undefined && typeof body !== "string"
          ? { "content-type": "application/json" }
          : {}),
        ...headers,
      },
      body:
        body === undefined ||
        typeof body === "string" ||
        body instanceof Uint8Array
          ? body
          : JSON.stringify(body),
    });

  const create = async (user, extra = {}) => {
    const res = await call(user, "POST", "/games", { game, ...extra });
    return { res, body: res.status === 201 ? await res.json() : null };
  };

  beforeAll(async () => {
    db = await makeTestDb();
    app = makeApp();
  });

  afterAll(async () => {
    await db.close();
  });

  it("creates a game from 18Test and the creator has a seat", async () => {
    const owner = await makeUser("Ann");
    const { res, body } = await create(owner, { seatName: "Annie" });
    expect(res.status).toBe(201);
    expect(body.id).toMatch(/^[0-9a-f-]{36}$/);
    expect(body.inviteCode).toMatch(/^[A-Za-z0-9_-]{22}$/);

    const list = await (await call(owner, "GET", "/games")).json();
    expect(list).toHaveLength(1);
    expect(list[0]).toMatchObject({
      id: body.id,
      title: game.info.title,
      status: "active",
      ownerId: owner.id,
    });
    expect(list[0].updatedAt).toBeTruthy();

    const detail = await (await call(owner, "GET", `/games/${body.id}`)).json();
    expect(detail.seats).toEqual([
      { userId: owner.id, name: "Annie", color: null },
    ]);
    expect(detail.game.info.title).toBe(game.info.title);
  });

  it("requires a user", async () => {
    expect((await call(null, "GET", "/games")).status).toBe(401);
  });

  it("rejects creation when can_create is false", async () => {
    const user = await makeUser("Nope", false);
    expect((await create(user)).res.status).toBe(403);
  });

  it("rejects an invalid game with 422 and errors", async () => {
    const user = await makeUser("Inv");
    const res = await call(user, "POST", "/games", {
      game: { info: { title: 5 }, bogus: true },
    });
    expect(res.status).toBe(422);
    expect((await res.json()).errors.length).toBeGreaterThan(0);
  });

  it("rejects an oversize game with 413", async () => {
    const small = makeApp({ MAX_GAME_BYTES: "100" });
    const user = await makeUser("Big");
    const res = await call(user, "POST", "/games", { game }, small);
    expect(res.status).toBe(413);
  });

  it("caps games per user", async () => {
    const capped = makeApp({ MAX_GAMES_PER_USER: "2" });
    const user = await makeUser("Cap");
    expect((await call(user, "POST", "/games", { game }, capped)).status).toBe(
      201,
    );
    expect((await call(user, "POST", "/games", { game }, capped)).status).toBe(
      201,
    );
    expect((await call(user, "POST", "/games", { game }, capped)).status).toBe(
      429,
    );
  });

  it("a non member gets 404 for a game", async () => {
    const owner = await makeUser("O");
    const other = await makeUser("X");
    const { body } = await create(owner);
    expect((await call(other, "GET", `/games/${body.id}`)).status).toBe(404);
    expect(
      (await call(other, "PATCH", `/games/${body.id}`, { status: "locked" }))
        .status,
    ).toBe(404);
    expect(
      (await call(other, "GET", `/games/${body.id}/assets/a.png`)).status,
    ).toBe(404);
  });

  it("a malformed id gives 404", async () => {
    const user = await makeUser("M");
    expect((await call(user, "GET", "/games/not-a-uuid")).status).toBe(404);
    expect((await call(user, "DELETE", "/games/not-a-uuid")).status).toBe(404);
  });

  const join = (user, code, body = { name: "Bob" }) =>
    call(user, "POST", `/invites/${code}/join`, body);

  it("only the owner sees the invite code", async () => {
    const owner = await makeUser("O");
    const guest = await makeUser("G");
    const { body } = await create(owner);
    await join(guest, body.inviteCode);

    const ownerView = await (
      await call(owner, "GET", `/games/${body.id}`)
    ).json();
    const guestView = await (
      await call(guest, "GET", `/games/${body.id}`)
    ).json();
    expect(ownerView.inviteCode).toBe(body.inviteCode);
    expect("inviteCode" in guestView).toBe(false);
  });

  it("joining by invite creates a seat and is idempotent", async () => {
    const owner = await makeUser("O");
    const guest = await makeUser("G");
    const { body } = await create(owner);

    const info = await (
      await call(null, "GET", `/invites/${body.inviteCode}`)
    ).json();
    expect(info).toEqual({ gameId: body.id, title: game.info.title });

    const first = await join(guest, body.inviteCode, {
      name: "Bob",
      color: "red",
    });
    expect(first.status).toBe(200);
    const seat = await first.json();
    expect(seat).toEqual({ userId: guest.id, name: "Bob", color: "red" });

    const again = await join(guest, body.inviteCode, {
      name: "Other",
      color: "blue",
    });
    expect(await again.json()).toEqual(seat);

    const detail = await (await call(owner, "GET", `/games/${body.id}`)).json();
    expect(detail.seats).toHaveLength(2);
  });

  it("a regenerated invite code makes the old code 404 and keeps seats", async () => {
    const owner = await makeUser("O");
    const guest = await makeUser("G");
    const { body } = await create(owner);
    await join(guest, body.inviteCode);

    const res = await call(owner, "POST", `/games/${body.id}/invite`);
    const { inviteCode } = await res.json();
    expect(inviteCode).not.toBe(body.inviteCode);
    expect(
      (await call(null, "GET", `/invites/${body.inviteCode}`)).status,
    ).toBe(404);
    expect((await call(null, "GET", `/invites/${inviteCode}`)).status).toBe(
      200,
    );
    const detail = await (await call(owner, "GET", `/games/${body.id}`)).json();
    expect(detail.seats).toHaveLength(2);
  });

  it("joining a locked game returns 410", async () => {
    const owner = await makeUser("O");
    const guest = await makeUser("G");
    const { body } = await create(owner);
    const patch = await call(owner, "PATCH", `/games/${body.id}`, {
      status: "locked",
    });
    expect(patch.status).toBe(200);
    expect((await join(guest, body.inviteCode)).status).toBe(410);
  });

  it("only the owner can lock, archive, delete, regenerate or upload assets", async () => {
    const owner = await makeUser("O");
    const guest = await makeUser("G");
    const { body } = await create(owner);
    await join(guest, body.inviteCode);
    const id = body.id;

    for (const [method, path, payload] of [
      ["PATCH", `/games/${id}`, { status: "locked" }],
      ["PATCH", `/games/${id}`, { status: "archived" }],
      ["DELETE", `/games/${id}`],
      ["POST", `/games/${id}/invite`],
      ["PUT", `/games/${id}/assets/a.png`, new Uint8Array([1])],
    ]) {
      expect((await call(guest, method, path, payload)).status).toBe(403);
    }

    expect(
      (await call(owner, "PATCH", `/games/${id}`, { status: "bogus" })).status,
    ).toBe(400);
    expect(
      (await call(owner, "PATCH", `/games/${id}`, { status: "archived" }))
        .status,
    ).toBe(200);
    expect((await call(owner, "DELETE", `/games/${id}`)).status).toBe(204);
    expect((await call(owner, "GET", `/games/${id}`)).status).toBe(404);
  });

  it("delete removes seats, events and assets", async () => {
    const owner = await makeUser("O");
    const { body } = await create(owner);
    await call(
      owner,
      "PUT",
      `/games/${body.id}/assets/a.png`,
      new Uint8Array([1, 2]),
      app,
      {
        "content-type": "image/png",
      },
    );
    await db.pool.query(
      "insert into events (game_id, seq, user_id, type, payload) values ($1, 1, $2, 'x', '{}')",
      [body.id, owner.id],
    );
    expect((await call(owner, "DELETE", `/games/${body.id}`)).status).toBe(204);
    for (const table of ["seats", "events", "game_assets"]) {
      const { rows } = await db.pool.query(
        `select 1 from ${table} where game_id = $1`,
        [body.id],
      );
      expect(rows).toHaveLength(0);
    }
  });

  it("asset upload over the cap returns 413", async () => {
    const small = makeApp({ MAX_ASSET_BYTES: "10" });
    const owner = await makeUser("O");
    const { body } = await create(owner);
    const res = await call(
      owner,
      "PUT",
      `/games/${body.id}/assets/a.png`,
      new Uint8Array(11),
      small,
      {
        "content-type": "image/png",
      },
    );
    expect(res.status).toBe(413);
  });

  it("asset download sets nosniff and attachment", async () => {
    const owner = await makeUser("O");
    const guest = await makeUser("G");
    const { body } = await create(owner);
    await join(guest, body.inviteCode);

    const put = await call(
      owner,
      "PUT",
      `/games/${body.id}/assets/a.svg`,
      new Uint8Array([1, 2, 3]),
      app,
      {
        "content-type": "image/svg+xml",
      },
    );
    expect(put.status).toBe(204);

    const res = await call(guest, "GET", `/games/${body.id}/assets/a.svg`);
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toBe("image/svg+xml");
    expect(res.headers.get("x-content-type-options")).toBe("nosniff");
    expect(res.headers.get("content-disposition")).toBe("attachment");
    expect([...new Uint8Array(await res.arrayBuffer())]).toEqual([1, 2, 3]);
    expect(
      (await call(guest, "GET", `/games/${body.id}/assets/none`)).status,
    ).toBe(404);
  });

  it("rejects a null config with 400", async () => {
    const user = await makeUser("Nul");
    const res = await call(user, "POST", "/games", { game, config: null });
    expect(res.status).toBe(400);
  });

  it("oversize bodies on patch and join return 413", async () => {
    const owner = await makeUser("O");
    const guest = await makeUser("G");
    const { body } = await create(owner);
    const big = JSON.stringify({ status: "locked", pad: "x".repeat(5000) });
    expect((await call(owner, "PATCH", `/games/${body.id}`, big)).status).toBe(
      413,
    );
    const bigJoin = JSON.stringify({ name: "Bob", pad: "x".repeat(5000) });
    expect((await join(guest, body.inviteCode, bigJoin)).status).toBe(413);
  });

  it("parallel creates cannot exceed the cap", async () => {
    const capped = makeApp({ MAX_GAMES_PER_USER: "2" });
    const user = await makeUser("Race");
    const results = await Promise.all(
      Array.from({ length: 6 }, () =>
        call(user, "POST", "/games", { game }, capped),
      ),
    );
    const statuses = results.map((r) => r.status).sort();
    expect(statuses).toEqual([201, 201, 429, 429, 429, 429]);
  });

  it("unknown invite codes return 404 on get and join", async () => {
    const user = await makeUser("U");
    expect((await call(null, "GET", "/invites/nope")).status).toBe(404);
    expect((await join(user, "nope")).status).toBe(404);
  });

  it("a seated member joining a locked game gets 410", async () => {
    const owner = await makeUser("O");
    const { body } = await create(owner);
    await call(owner, "PATCH", `/games/${body.id}`, { status: "locked" });
    expect((await join(owner, body.inviteCode)).status).toBe(410);
  });
});
