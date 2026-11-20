// Move notices of a game, posted to the Discord webhook its owner set. Lines
// are collected per game and posted once per WEBHOOK_BATCH_MS, at most
// WEBHOOK_MAX_PER_MINUTE times a minute. Nothing here may delay, fail or
// reorder a game event: notify only queues, and every failure is logged
// (never with the URL, which is a secret) and swallowed.

const CONTENT_MAX = 1900;
const NAME_MAX = 50;
const ID_MAX = 40;
const URL_MAX = 256;
// Lines a game may have waiting; past this they are counted, not kept
const PENDING_MAX = 200;
const MINUTE = 60_000;
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
  const { webhookBatchMs: batchMs, webhookMaxPerMinute: perMinute } =
    config.limits;
  // gameId -> { items, dropped, timer, busy, posts: start times of the last minute }
  const games = new Map();
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
        body: JSON.stringify({ content, allowed_mentions: { parse: [] } }),
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

  const arm = (gameId, state, ms) => {
    if (closed || state.timer || state.busy) return;
    state.timer = schedule(() => {
      state.timer = null;
      flush(gameId, state);
    }, ms);
  };

  const flush = async (gameId, state) => {
    state.busy = true;
    let delay = batchMs;
    try {
      const start = now();
      state.posts = state.posts.filter((t) => start - t < MINUTE);
      if (state.posts.length >= perMinute) {
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
      if (!url || closed) return;
      const names = new Map(rows.map((r) => [r.user_id, r.name]));
      const lines = taken.map((item) =>
        typeof item === "string"
          ? item
          : describeEvent(item, names.get(item.userId)),
      );
      if (dropped) lines.push(`(${dropped} more moves not shown)`);
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
        state.items = [...lines, ...state.items];
        delay = Math.min(result.retryAfter ?? batchMs, MINUTE);
        return;
      }
      if (result.error || result.status < 200 || result.status >= 300) {
        log(gameId, result.error ?? result.status);
      }
      state.items = [...rest, ...state.items];
    } catch (err) {
      log(gameId, reasonOf(err));
    } finally {
      state.busy = false;
      if (state.items.length || state.dropped) arm(gameId, state, delay);
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
    // Posts "Notifications connected" to a new webhook now; false when Discord
    // says it does not exist (401/404), true otherwise (a failure is logged)
    connected: async (gameId, url) => {
      stateOf(gameId).posts.push(now());
      const result = await post(url, "Notifications connected");
      if (result.status === 401 || result.status === 404) return false;
      if (result.error || result.status < 200 || result.status >= 300) {
        log(gameId, result.error ?? result.status);
      }
      return true;
    },
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
