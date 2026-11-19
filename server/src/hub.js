import { WebSocket, WebSocketServer } from "ws";

import { initialState } from "../../src/play/reduce.js";
import { sha256 } from "./auth.js";
import { appendEvent, eventsSince, lastSeq, loadSnapshot } from "./events.js";

// Frames are small JSON messages; ws closes the socket (1009) above this
export const MAX_FRAME_BYTES = 256 * 1024;

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const MAX_SEQ = 2 ** 31 - 1;
const JOIN_FAILED = 4003;

const isSeq = (n, min) => Number.isInteger(n) && n >= min && n <= MAX_SEQ;

const parse = (data, isBinary) => {
  if (isBinary) return null;
  try {
    const msg = JSON.parse(data.toString("utf8"));
    return msg && typeof msg === "object" && !Array.isArray(msg) ? msg : null;
  } catch {
    return null;
  }
};

export const attachHub = (server, { pool, config }) => {
  const { limits } = config;
  const wss = new WebSocketServer({
    noServer: true,
    maxPayload: MAX_FRAME_BYTES,
  });
  // gameId -> { sockets: Set<ws>, queue: Promise } (queue keeps broadcasts in seq order)
  const rooms = new Map();
  const states = new WeakMap();

  const send = (ws, msg) => {
    if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(msg));
  };
  const error = (ws, code, message) =>
    send(ws, { t: "error", code, ...(message ? { message } : {}) });

  const presence = (room) => [
    ...new Set([...room.sockets].map((ws) => states.get(ws).userId)),
  ];

  const broadcast = (room, msg) => {
    for (const ws of room.sockets) {
      const state = states.get(ws);
      // A socket still catching up gets it after its history
      if (state.buffer) state.buffer.push(msg);
      else send(ws, msg);
    }
  };

  const leave = (ws) => {
    const state = states.get(ws);
    clearTimeout(state.timer);
    state.closed = true;
    const room = state.gameId && rooms.get(state.gameId);
    if (!room || !room.sockets.delete(ws)) return;
    if (room.sockets.size === 0) rooms.delete(state.gameId);
    else broadcast(room, { t: "presence", users: presence(room) });
  };

  const join = async (ws, state, msg) => {
    const { token, gameId, lastSeq: since } = msg;
    if (
      typeof token !== "string" ||
      typeof gameId !== "string" ||
      !UUID.test(gameId) ||
      !isSeq(since, 0)
    )
      return error(ws, "invalid", "join needs token, gameId and lastSeq");
    if (state.joining) return error(ws, "invalid", "already joined");
    state.joining = true;

    const user = await pool.query(
      "select user_id from sessions where token_hash = $1",
      [sha256(token)],
    );
    if (!user.rows.length) {
      error(ws, "bad_token");
      return ws.close(JOIN_FAILED, "bad token");
    }
    const game = await pool.query("select 1 from games where id = $1", [
      gameId,
    ]);
    if (!game.rows.length) {
      error(ws, "not_member", "Unknown game");
      return ws.close(JOIN_FAILED, "unknown game");
    }
    if (state.closed) return;

    clearTimeout(state.timer);
    state.userId = user.rows[0].user_id;
    state.gameId = gameId;
    state.buffer = [];
    if (!rooms.has(gameId))
      rooms.set(gameId, { sockets: new Set(), queue: Promise.resolve() });
    const room = rooms.get(gameId);
    room.sockets.add(ws);

    const current = await lastSeq(pool, gameId);
    const seats = await pool.query(
      "select user_id, name, color from seats where game_id = $1 order by created_at",
      [gameId],
    );
    let catchUp;
    if (since > current || current - since > limits.snapshotEvery * 5) {
      const snap = (await loadSnapshot(pool, gameId)) ?? {
        seq: 0,
        state: initialState(),
      };
      const events = await eventsSince(pool, gameId, snap.seq);
      catchUp = { t: "snapshot", seq: snap.seq, state: snap.state, events };
    } else {
      catchUp = { t: "events", events: await eventsSince(pool, gameId, since) };
    }
    const sent = catchUp.events.reduce((max, e) => Math.max(max, e.seq), 0);

    send(ws, {
      t: "joined",
      seq: current,
      seats: seats.rows.map((r) => ({
        userId: r.user_id,
        name: r.name,
        color: r.color,
      })),
      presence: presence(room),
    });
    send(ws, catchUp);
    for (const m of state.buffer) {
      if (m.t !== "event" || m.event.seq > sent) send(ws, m);
    }
    state.buffer = null;
    broadcast(room, { t: "presence", users: presence(room) });
  };

  const event = async (ws, state, msg) => {
    if (!state.gameId || state.buffer)
      return error(ws, "invalid", "join first");
    const now = Date.now();
    if (now - state.windowStart >= 1000) {
      state.windowStart = now;
      state.windowCount = 0;
    }
    if (++state.windowCount > limits.eventsPerSecond)
      return error(ws, "rate_limited");
    if (!isSeq(msg.seq, 1)) return error(ws, "invalid", "seq out of range");

    const { seq, event: body } = msg;
    const { gameId, userId } = state;
    const room = rooms.get(gameId);
    const run = room.queue.then(async () => {
      const result = await appendEvent(pool, config, {
        gameId,
        userId,
        seq,
        event: body,
      });
      if (result.ok) {
        const payload = { ...body };
        delete payload.type;
        broadcast(room, {
          t: "event",
          event: { seq, userId, type: body.type, ...payload },
        });
      } else if (result.reason === "conflict") {
        send(ws, { t: "rebase", currentSeq: result.currentSeq });
      } else {
        error(ws, result.reason, result.message);
      }
    });
    room.queue = run.catch(() => {});
    return run;
  };

  const handlers = { join, event };

  wss.on("connection", (ws) => {
    const state = {
      userId: null,
      gameId: null,
      joining: false,
      closed: false,
      buffer: null,
      windowStart: 0,
      windowCount: 0,
      timer: setTimeout(
        () => ws.close(4001, "join timeout"),
        limits.joinTimeoutMs,
      ),
    };
    states.set(ws, state);

    ws.on("message", (data, isBinary) => {
      const msg = parse(data, isBinary);
      const handler = msg && Object.hasOwn(handlers, msg.t) && handlers[msg.t];
      if (!handler) return error(ws, "invalid", "unknown frame");
      handler(ws, state, msg).catch((err) => {
        console.error("hub:", err);
        error(ws, "server_error");
        // A join that failed halfway leaves the socket in no usable state
        if (msg.t === "join") ws.close(1011, "join failed");
      });
    });
    ws.on("close", () => leave(ws));
    ws.on("error", () => leave(ws));
  });

  server.on("upgrade", (req, socket, head) => {
    let pathname;
    try {
      ({ pathname } = new URL(req.url, "http://localhost"));
    } catch {
      pathname = null;
    }
    if (pathname !== "/ws") {
      socket.end("HTTP/1.1 404 Not Found\r\nConnection: close\r\n\r\n");
      return;
    }
    wss.handleUpgrade(req, socket, head, (ws) => wss.emit("connection", ws));
  });

  return {
    close: () => {
      for (const ws of wss.clients) ws.terminate();
      wss.close();
    },
  };
};
