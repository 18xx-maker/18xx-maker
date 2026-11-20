import { afterEach, describe, expect, it, vi } from "vitest";

import { loadConfig } from "./config.js";
import { createNotifier, describeEvent, isWebhookUrl } from "./webhook.js";

const URL_A = "https://discord.com/api/webhooks/123/abc-DEF_9";
const GAME = "g1";

const configFor = (extra = {}) =>
  loadConfig({
    DATABASE_URL: "x",
    PUBLIC_URL: "http://play.test",
    DISCORD_CLIENT_ID: "cid",
    DISCORD_CLIENT_SECRET: "secret",
    WEBHOOK_BATCH_MS: "1000",
    WEBHOOK_MAX_PER_MINUTE: "2",
    ...extra,
  });

const settle = async () => {
  for (let i = 0; i < 5; i++) await new Promise((r) => setImmediate(r));
};

// Time that only moves when a test says so; due timers run in order
const manualClock = () => {
  let t = 0;
  const timers = [];
  return {
    now: () => t,
    schedule: (fn, ms) => {
      const timer = { fn, at: t + ms };
      timers.push(timer);
      return timer;
    },
    cancel: (timer) => {
      const i = timers.indexOf(timer);
      if (i >= 0) timers.splice(i, 1);
    },
    advance: async (ms) => {
      const end = t + ms;
      for (;;) {
        const due = timers
          .filter((x) => x.at <= end)
          .sort((a, b) => a.at - b.at)[0];
        if (!due) break;
        timers.splice(timers.indexOf(due), 1);
        t = due.at;
        due.fn();
        await settle();
      }
      t = end;
    },
    timers,
  };
};

// The two queries the notifier makes: the flush read and the clear
const fakePool = ({ url = URL_A, seats = [["u1", "Alice"]] } = {}) => {
  const db = { url, reads: 0 };
  db.query = vi.fn(async (sql, params) => {
    if (sql.startsWith("select")) {
      db.reads++;
      if (db.url === undefined) return { rows: [] };
      const rows = seats.map(([user_id, name]) => ({
        webhook_url: db.url,
        user_id,
        name,
      }));
      return {
        rows: rows.length
          ? rows
          : [{ webhook_url: db.url, user_id: null, name: null }],
      };
    }
    if (sql.startsWith("update")) {
      if (db.url === params[1]) db.url = null;
      return { rowCount: 1 };
    }
    throw new Error(`unexpected ${sql}`);
  });
  return db;
};

const fakeFetch = (answer = () => new Response(null, { status: 204 })) => {
  const posts = [];
  const fetch = vi.fn(async (url, init) => {
    posts.push({ url, init, body: JSON.parse(init.body) });
    return answer(posts.length, url, init);
  });
  return { fetch, posts };
};

const setup = ({ pool = fakePool(), answer, config = configFor() } = {}) => {
  const clock = manualClock();
  const { fetch, posts } = fakeFetch(answer);
  const notifier = createNotifier({
    pool,
    config,
    fetch,
    schedule: clock.schedule,
    cancel: clock.cancel,
    now: clock.now,
  });
  return { clock, fetch, posts, notifier, pool };
};

const move = (extra = {}) => ({
  seq: 1,
  userId: "u1",
  type: "tile.place",
  hex: "A1",
  tile: "7",
  rotation: 0,
  ...extra,
});

describe("isWebhookUrl", () => {
  it.each([
    [URL_A, true],
    ["https://discordapp.com/api/webhooks/1/x", true],
    ["https://discord.com/api/webhooks/1/x?wait=true", false],
    ["https://discord.com/api/webhooks/abc/x", false],
    ["https://discord.com/api/webhooks/1/x/extra", false],
    ["http://discord.com/api/webhooks/1/x", false],
    ["https://evil.com/api/webhooks/1/x", false],
    ["https://discord.com.evil.com/api/webhooks/1/x", false],
    ["https://discord.com/api/webhooks/1/x y", false],
    [`https://discord.com/api/webhooks/1/${"x".repeat(300)}`, false],
    [42, false],
  ])("%s is %s", (url, ok) => {
    expect(isWebhookUrl(url, "https://discord.com")).toBe(ok);
  });

  it("follows the configured origin and drops discordapp.com off the default", () => {
    const origin = "http://127.0.0.1:9999";
    expect(isWebhookUrl(`${origin}/api/webhooks/1/x`, origin)).toBe(true);
    expect(isWebhookUrl(URL_A, origin)).toBe(false);
    expect(
      isWebhookUrl("https://discordapp.com/api/webhooks/1/x", origin),
    ).toBe(false);
  });
});

describe("describeEvent", () => {
  it.each([
    [move(), "Alice placed tile 7 on A1"],
    [
      { type: "tile.rotate", hex: "A1", rotation: 2 },
      "Alice rotated the tile on A1",
    ],
    [{ type: "tile.remove", hex: "A1" }, "Alice removed the tile from A1"],
    [
      { type: "token.place", hex: "B2", token: "PRR", x: 0, y: 0 },
      "Alice placed a PRR token on B2",
    ],
    [
      { type: "token.remove", hex: "B2", token: "PRR", x: 0, y: 0 },
      "Alice removed a PRR token from B2",
    ],
    [
      { type: "market.move", marker: "PRR", cell: { row: 1, col: 2 } },
      "Alice moved PRR on the market",
    ],
    [
      { type: "tray.move", item: "T2", from: "bank", to: "PRR" },
      "Alice moved T2 from the bank to PRR",
    ],
    [{ type: "note.set", text: "secret plan" }, "Alice updated the notes"],
    [{ type: "undo", target: 4 }, "Alice undid move 4"],
    [{ type: "something.new" }, "Alice made a move"],
  ])("%j", (event, line) => {
    expect(describeEvent(event, "Alice")).toBe(line);
  });

  it("never includes note text", () => {
    const line = describeEvent(
      { type: "note.set", text: "@everyone meet at the bank" },
      "Alice",
    );
    expect(line).not.toMatch(/everyone|bank/);
  });

  it("falls back when the seat is unknown", () => {
    expect(describeEvent(move(), undefined)).toBe(
      "A player placed tile 7 on A1",
    );
    expect(describeEvent(move(), "  @ ")).toBe("A player placed tile 7 on A1");
  });

  it("drops mention characters and escapes markdown in names and ids", () => {
    const line = describeEvent(
      move({ hex: "<@123>", tile: "`x`" }),
      "@everyone **Bob**_\n# @here",
    );
    expect(line).not.toMatch(/[@`<>\n]/);
    expect(line).toBe(
      "everyone \\*\\*Bob\\*\\*\\_\\# here placed tile x on 123",
    );
  });

  it("caps long names and ids", () => {
    const line = describeEvent(move({ hex: "h".repeat(100) }), "n".repeat(80));
    expect(line).toBe(`${"n".repeat(49)}… placed tile 7 on ${"h".repeat(39)}…`);
  });
});

describe("createNotifier", () => {
  afterEach(() => vi.restoreAllMocks());

  it("merges the lines of one batch window into one post", async () => {
    const { clock, posts, notifier, pool } = setup();
    notifier.notify(GAME, move());
    notifier.notify(GAME, move({ seq: 2, type: "tile.rotate", rotation: 1 }));
    await clock.advance(999);
    expect(posts).toHaveLength(0);
    await clock.advance(1);
    expect(posts).toHaveLength(1);
    expect(posts[0].url).toBe(URL_A);
    expect(posts[0].init.method).toBe("POST");
    expect(posts[0].init.headers["content-type"]).toBe("application/json");
    expect(posts[0].init.signal).toBeInstanceOf(AbortSignal);
    expect(posts[0].body).toEqual({
      content: "Alice placed tile 7 on A1\nAlice rotated the tile on A1",
      allowed_mentions: { parse: [] },
    });
    // One read per flush, for the URL and every seat name
    expect(pool.reads).toBe(1);
  });

  it("posts at most WEBHOOK_MAX_PER_MINUTE times a minute and merges the rest", async () => {
    const { clock, posts, notifier } = setup();
    for (let i = 1; i <= 2; i++) {
      notifier.notify(GAME, `line ${i}`);
      await clock.advance(1000);
    }
    expect(posts).toHaveLength(2);
    notifier.notify(GAME, "line 3");
    await clock.advance(1000);
    notifier.notify(GAME, "line 4");
    await clock.advance(30000);
    expect(posts).toHaveLength(2);
    // The window opens a minute after the first post (at 1000)
    await clock.advance(61000 - clock.now());
    expect(posts).toHaveLength(3);
    expect(posts[2].body.content).toBe("line 3\nline 4");
  });

  it("keeps each post under 1900 characters and carries the rest over", async () => {
    const { clock, posts, notifier } = setup({
      config: configFor({ WEBHOOK_MAX_PER_MINUTE: "10" }),
    });
    const lines = Array.from(
      { length: 30 },
      (_, i) => `${String(i).padStart(2, "0")} ${"x".repeat(97)}`,
    );
    for (const line of lines) notifier.notify(GAME, line);
    notifier.notify(GAME, "y".repeat(3000));
    await clock.advance(1000);
    expect(posts).toHaveLength(1);
    const first = posts[0].body.content.split("\n");
    expect(posts[0].body.content.length).toBeLessThanOrEqual(1900);
    expect(first).toEqual(lines.slice(0, first.length));
    await clock.advance(1000);
    expect(posts).toHaveLength(2);
    const second = posts[1].body.content.split("\n");
    expect(second).toEqual(lines.slice(first.length));
    await clock.advance(1000);
    expect(posts).toHaveLength(3);
    expect(posts[2].body.content).toBe(`${"y".repeat(1899)}…`);
    await clock.advance(10000);
    expect(posts).toHaveLength(3);
  });

  it.each([404, 401])(
    "clears the webhook when Discord answers %s",
    async (status) => {
      const pool = fakePool();
      const { clock, posts, notifier } = setup({
        pool,
        answer: () => new Response("{}", { status }),
      });
      notifier.notify(GAME, move());
      await clock.advance(1000);
      expect(posts).toHaveLength(1);
      expect(pool.url).toBe(null);
      expect(pool.query).toHaveBeenCalledWith(
        "update games set webhook_url = null where id = $1 and webhook_url = $2",
        [GAME, URL_A],
      );
      notifier.notify(GAME, move({ seq: 2 }));
      await clock.advance(1000);
      expect(posts).toHaveLength(1);
    },
  );

  it("waits out a 429 and posts the same lines again", async () => {
    const { clock, posts, notifier } = setup({
      config: configFor({ WEBHOOK_MAX_PER_MINUTE: "10" }),
      answer: (n) =>
        n === 1
          ? new Response("{}", { status: 429, headers: { "retry-after": "7" } })
          : new Response(null, { status: 204 }),
    });
    notifier.notify(GAME, "one");
    await clock.advance(1000);
    expect(posts).toHaveLength(1);
    notifier.notify(GAME, "two");
    await clock.advance(6999);
    expect(posts).toHaveLength(1);
    await clock.advance(1);
    expect(posts).toHaveLength(2);
    expect(posts[1].body.content).toBe("one\ntwo");
  });

  it("drops a batch that fails or times out, logging no URL", async () => {
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    const failures = [
      () => {
        throw new DOMException("timed out", "TimeoutError");
      },
      () => new Response("boom", { status: 500 }),
      () => {
        throw new TypeError(`fetch failed ${URL_A}`);
      },
    ];
    const { clock, posts, notifier } = setup({
      config: configFor({ WEBHOOK_MAX_PER_MINUTE: "10" }),
      answer: (n) => failures[n - 1](),
    });
    for (const line of ["a", "b", "c"]) {
      notifier.notify(GAME, line);
      await clock.advance(1000);
    }
    expect(posts.map((p) => p.body.content)).toEqual(["a", "b", "c"]);
    await clock.advance(10000);
    expect(posts).toHaveLength(3);
    expect(log).toHaveBeenCalledTimes(3);
    for (const call of log.mock.calls) {
      expect(call.join(" ")).not.toContain("abc-DEF_9");
      expect(call.join(" ")).not.toContain("webhooks");
    }
  });

  it("never throws into notify, even when the database fails", async () => {
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    const pool = {
      query: vi.fn(async () => {
        throw new Error("db down");
      }),
    };
    const { clock, posts, notifier } = setup({ pool });
    expect(() => notifier.notify(GAME, move())).not.toThrow();
    await clock.advance(1000);
    expect(posts).toHaveLength(0);
    expect(log).toHaveBeenCalled();
  });

  it("drops lines of a game without a webhook", async () => {
    const { clock, posts, notifier } = setup({ pool: fakePool({ url: null }) });
    notifier.notify(GAME, move());
    await clock.advance(1000);
    expect(posts).toHaveLength(0);
    expect(clock.timers).toHaveLength(0);
  });

  it("uses the seat name of each line's user, with a fallback", async () => {
    const { clock, posts, notifier } = setup({
      pool: fakePool({
        seats: [
          ["u1", "Alice"],
          ["u2", "@Bob"],
        ],
      }),
    });
    notifier.notify(GAME, move());
    notifier.notify(GAME, move({ userId: "u2" }));
    notifier.notify(GAME, move({ userId: "gone" }));
    await clock.advance(1000);
    expect(posts[0].body.content).toBe(
      [
        "Alice placed tile 7 on A1",
        "Bob placed tile 7 on A1",
        "A player placed tile 7 on A1",
      ].join("\n"),
    );
  });

  it("connected posts at once and reports a rejected webhook", async () => {
    const { posts, notifier } = setup({
      answer: (n) => new Response(null, { status: n === 1 ? 204 : 404 }),
    });
    expect(await notifier.connected(GAME, URL_A)).toBe(true);
    expect(posts[0].body).toEqual({
      content: "Notifications connected",
      allowed_mentions: { parse: [] },
    });
    expect(await notifier.connected(GAME, URL_A)).toBe(false);
  });

  it("close cancels the timers and ignores later lines", async () => {
    const { clock, posts, notifier } = setup();
    notifier.notify(GAME, move());
    expect(clock.timers).toHaveLength(1);
    notifier.close();
    expect(clock.timers).toHaveLength(0);
    notifier.notify(GAME, move());
    expect(clock.timers).toHaveLength(0);
    await clock.advance(5000);
    expect(posts).toHaveLength(0);
  });
});
