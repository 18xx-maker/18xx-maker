// Move notices of a game, posted to the Discord webhook its owner set. Lines
// are collected per game and posted once per WEBHOOK_BATCH_MS, at most
// WEBHOOK_MAX_PER_MINUTE times a minute. The test post of a new webhook is
// also limited per owner (WEBHOOK_MAX_PER_MINUTE across all their games) and
// for the whole server (WEBHOOK_TEST_PER_MINUTE), so making, patching and
// deleting games cannot flood Discord with posts to bad webhooks. Nothing here may delay, fail or
// reorder a game event: notify only queues, and every failure is logged
// (never with the URL, which is a secret) and swallowed.

const CONTENT_MAX = 1900;
const NAME_MAX = 50;
const ID_MAX = 40;
const URL_MAX = 256;
// Lines a game may have waiting; past this they are counted, not kept
const PENDING_MAX = 200;
const MINUTE = 60_000;
const SUPPRESS_EMBEDS = 4;
const DEFAULT_ORIGIN = "https://discord.com";

const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Only `<origin>/api/webhooks/<id>/<token>`, plus discordapp.com when the
// origin is Discord's own
export const isWebhookUrl = (url, origin) => {
  if (typeof url !== "string" || url.length > URL_MAX) return false;
  const origins =
    origin === DEFAULT_ORIGIN ? [origin, "https://discordapp.com"] : [origin];
  return origins.some((o) =>
    new RegExp(`^${escapeRegExp(o)}/api/webhooks/\\d+/[\\w-]+$`).test(url),
  );
};

// Player text in a notice: one line, without the characters of mentions
// (`@`, `<`, `>`) and code spans, with Discord markdown escaped
const clean = (value, max) => {
  const text = String(value ?? "")
    .replace(/[\p{Cc}\u2028\u2029@<>`]/gu, "")
    .trim();
  const cut = text.length > max ? `${text.slice(0, max - 1)}…` : text;
  return cut.replace(/[\\*_~|#[\]()-]/g, "\\$&");
};

const place = (v) => (v === "bank" ? "the bank" : clean(v, ID_MAX));

// The English line of an event; note text is never part of it
export const describeEvent = (event, seatName) => {
  const who = clean(seatName, NAME_MAX) || "A player";
  const id = (v) => clean(v, ID_MAX);
  switch (event.type) {
    case "tile.place":
      return `${who} placed tile ${id(event.tile)} on ${id(event.hex)}`;
    case "tile.rotate":
      return `${who} rotated the tile on ${id(event.hex)}`;
    case "tile.remove":
      return `${who} removed the tile from ${id(event.hex)}`;
    case "token.place":
      return `${who} placed a ${id(event.token)} token on ${id(event.hex)}`;
    case "token.remove":
      return `${who} removed a ${id(event.token)} token from ${id(event.hex)}`;
    case "market.move":
      return `${who} moved ${id(event.marker)} on the market`;
    case "tray.move":
      return `${who} moved ${id(event.item)} from ${place(event.from)} to ${place(event.to)}`;
    case "note.set":
      return `${who} updated the notes`;
    case "undo":
      return `${who} undid move ${Number(event.target) || "?"}`;
    default:
      return `${who} made a move`;
  }
};

// The lines that fit one post, and the ones left for the next
const pack = (lines) => {
  let content = "";
  let i = 0;
  for (; i < lines.length; i++) {
    const line =
      lines[i].length > CONTENT_MAX
        ? `${lines[i].slice(0, CONTENT_MAX - 1)}…`
        : lines[i];
    const next = content ? `${content}\n${line}` : line;
    if (next.length > CONTENT_MAX) break;
    content = next;
  }
  return { content, rest: lines.slice(i) };
};

// The reason of a failed post, safe to log (an error message may hold the URL)
const reasonOf = (err) =>
  [err?.name, err?.cause?.code].filter(Boolean).join(" ") || "error";

export const createNotifier = ({
  pool,
  config,
  fetch = globalThis.fetch,
  schedule = setTimeout,
  cancel = clearTimeout,
  now = Date.now,
}) => {
  const {
    webhookBatchMs: batchMs,
    webhookMaxPerMinute: perMinute,
    webhookTestPerMinute: testPerMinute,
  } = config.limits;
  // gameId -> { items, dropped, timer, busy, posts: start times of the last minute }
  const games = new Map();
  // userId -> times of the test posts of the last minute; only owners with a
  // post in the last minute are kept, so never more than testPerMinute
  const owners = new Map();
  // Times of every test post of the last minute
  let tests = [];
  let closed = false;

  const log = (gameId, reason) =>
    console.error(`webhook: post for game ${gameId} failed (${reason})`);

  const stateOf = (gameId) => {
    if (!games.has(gameId))
      games.set(gameId, {
        items: [],
        dropped: 0,
        timer: null,
        busy: false,
        posts: [],
      });
    return games.get(gameId);
  };

  // Resolves to { status, retryAfter? } or { error }
  const post = async (url, content) => {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "content-type": "application/json" },
        // No pings, no link previews of player text (flags: SUPPRESS_EMBEDS)
        body: JSON.stringify({
          content,
          allowed_mentions: { parse: [] },
          flags: SUPPRESS_EMBEDS,
        }),
        // A webhook never redirects; a redirect is a failure, not followed
        redirect: "error",
        signal: AbortSignal.timeout(config.discord.timeoutMs),
      });
      let retryAfter = Number(res.headers.get("retry-after"));
      if (res.status === 429 && !(retryAfter > 0)) {
        retryAfter = Number((await res.json().catch(() => ({}))).retry_after);
      }
      await res.body?.cancel().catch(() => {});
      return {
        status: res.status,
        retryAfter: retryAfter > 0 ? retryAfter * 1000 : null,
      };
    } catch (err) {
      return { error: reasonOf(err) };
    }
  };

  // Prunes the posts of the last minute; true when another one may go out, so
  // posts never holds more than perMinute times
  const mayPost = (state, at) => {
    state.posts = state.posts.filter((t) => at - t < MINUTE);
    return state.posts.length < perMinute;
  };

  // The owners' windows of the last minute, the expired ones dropped
  const pruneOwners = (at) => {
    for (const [userId, times] of owners) {
      const live = times.filter((t) => at - t < MINUTE);
      if (live.length) owners.set(userId, live);
      else owners.delete(userId);
    }
    tests = tests.filter((t) => at - t < MINUTE);
  };

  // A game with nothing waiting and no post in the last minute is dropped
  // (its window is empty, so nothing is lost); its next line starts anew
  const dropIfIdle = (gameId, state, at) => {
    if (state.items.length || state.dropped || state.timer || state.busy)
      return;
    state.posts = state.posts.filter((t) => at - t < MINUTE);
    if (state.posts.length) return;
    if (games.get(gameId) === state) games.delete(gameId);
  };

  // Lines put back in front of newer ones stay within PENDING_MAX; the
  // newest past it are counted, not kept
  const requeue = (state, lines) => {
    const items = [...lines, ...state.items];
    state.dropped += Math.max(0, items.length - PENDING_MAX);
    state.items = items.slice(0, PENDING_MAX);
  };

  const arm = (gameId, state, ms) => {
    if (closed || state.forgotten || state.timer || state.busy) return;
    state.timer = schedule(() => {
      state.timer = null;
      flush(gameId, state);
    }, ms);
  };

  const flush = async (gameId, state) => {
    state.busy = true;
    let delay = batchMs;
    let gone = false;
    try {
      const start = now();
      if (!mayPost(state, start)) {
        // Over the limit: the lines wait and merge into the next post
        delay = Math.max(1, state.posts[0] + MINUTE - start);
        return;
      }
      const taken = state.items;
      const dropped = state.dropped;
      state.items = [];
      state.dropped = 0;

      // One read per flush: the URL and the name of every seat
      const { rows } = await pool.query(
        `select g.webhook_url, s.user_id, s.name from games g
           left join seats s on s.game_id = g.id
          where g.id = $1`,
        [gameId],
      );
      const url = rows[0]?.webhook_url;
      if (!url || closed) {
        // No webhook (cleared or the game deleted): the lines are dropped
        gone = true;
        return;
      }
      const names = new Map(rows.map((r) => [r.user_id, r.name]));
      const described = taken.map((item) =>
        typeof item === "string"
          ? item
          : describeEvent(item, names.get(item.userId)),
      );
      const lines = dropped
        ? [...described, `(${dropped} more moves not shown)`]
        : described;
      const { content, rest } = pack(lines);

      state.posts.push(now());
      const result = await post(url, content);
      if (result.status === 401 || result.status === 404) {
        // The webhook is gone: notices are off until the owner sets one
        await pool.query(
          "update games set webhook_url = null where id = $1 and webhook_url = $2",
          [gameId, url],
        );
        return;
      }
      if (result.status === 429) {
        state.dropped += dropped;
        requeue(state, described);
        delay = Math.min(result.retryAfter ?? batchMs, MINUTE);
        return;
      }
      if (result.error || result.status < 200 || result.status >= 300) {
        log(gameId, result.error ?? result.status);
      }
      requeue(state, rest);
    } catch (err) {
      log(gameId, reasonOf(err));
    } finally {
      state.busy = false;
      if (gone) {
        state.items = [];
        state.dropped = 0;
        dropIfIdle(gameId, state, now());
      } else if (state.items.length || state.dropped) {
        arm(gameId, state, delay);
      }
    }
  };

  return {
    // line: a string, or an event whose line is made at the flush with the
    // seat name of its user. Never throws, never waits.
    notify: (gameId, line) => {
      if (closed) return;
      try {
        const state = stateOf(gameId);
        if (state.items.length >= PENDING_MAX) state.dropped++;
        else if (typeof line === "string") state.items.push(line);
        // Note text is never posted, so it is not kept either
        else state.items.push({ ...line, text: undefined });
        arm(gameId, state, batchMs);
      } catch (err) {
        log(gameId, reasonOf(err));
      }
    },
    // Posts "Notifications connected" to a new webhook of userId's game now.
    // It counts against the game's WEBHOOK_MAX_PER_MINUTE like any post, the
    // owner's own WEBHOOK_MAX_PER_MINUTE over all their games and the server's
    // WEBHOOK_TEST_PER_MINUTE. Resolves to "limited" (a window is full: nothing
    // sent), "rejected" (Discord answered 401 or 404) or "ok" (sent, or failed
    // otherwise and logged)
    connected: async (gameId, url, userId) => {
      const at = now();
      pruneOwners(at);
      const mine = owners.get(userId) ?? [];
      if (mine.length >= perMinute || tests.length >= testPerMinute)
        return "limited";
      const state = stateOf(gameId);
      if (!mayPost(state, at)) return "limited";
      state.posts.push(at);
      owners.set(userId, [...mine, at]);
      tests.push(at);
      const result = await post(url, "Notifications connected");
      if (result.status === 401 || result.status === 404) return "rejected";
      if (result.error || result.status < 200 || result.status >= 300) {
        log(gameId, result.error ?? result.status);
      }
      return "ok";
    },
    // Drops the game's state and waiting lines (the game was deleted)
    forget: (gameId) => {
      const state = games.get(gameId);
      if (!state) return;
      if (state.timer) cancel(state.timer);
      state.timer = null;
      state.forgotten = true;
      games.delete(gameId);
    },
    // How many games and owners are tracked
    sizes: () => ({ games: games.size, users: owners.size }),
    close: () => {
      closed = true;
      for (const state of games.values()) {
        if (state.timer) cancel(state.timer);
        state.timer = null;
      }
      games.clear();
    },
  };
};
