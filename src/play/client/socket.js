import { validateEvent } from "../events.js";

// Websocket session of one play game (protocol in server/README.md). The log
// holds only events the server sent (no optimistic apply), sorted and unique
// by seq. Local events wait in a queue and go out one at a time, numbered from
// the highest seq held: with one on the wire a conflict can never reorder two
// of them. A dropped socket or a rebase reconnects, catches up from the held
// seq and then sends the head of the queue again unless the catch-up shows the
// server already accepted it.
const DENIED = 4003;
const MAX_DELAY = 15000;

const same = (a, b) =>
  a === b ||
  (typeof a === "object" &&
    a !== null &&
    typeof b === "object" &&
    b !== null &&
    Object.keys(a).every((key) => same(a[key], b[key])));

export const createSession = ({
  baseUrl,
  token,
  gameId,
  WebSocket = globalThis.WebSocket,
  schedule = setTimeout,
  cancel = clearTimeout,
}) => {
  const url = `${baseUrl.replace(/\/+$/, "").replace(/^http/, "ws")}/ws`;
  const listeners = new Set();
  let view = {
    status: "connecting",
    log: [],
    seats: [],
    presence: [],
    pending: 0,
  };
  let queue = [];
  let sent = null; // seq of queue[0] sent on this socket
  let unsure = null; // seq of queue[0] sent on an earlier socket
  let ws = null;
  const timers = new Set();
  let retrying = false;
  let attempt = 0;
  let locked = false;
  let closed = false;

  const update = (changes) => {
    view = { ...view, ...changes, pending: queue.length };
    for (const listener of listeners) listener(view);
  };

  const lastSeq = () => view.log.at(-1)?.seq ?? 0;

  const merge = (log, events) => {
    const held = new Set(log.map((e) => e.seq));
    const fresh = events.filter((e) => !held.has(e.seq) && held.add(e.seq));
    return fresh.length
      ? [...log, ...fresh].sort((a, b) => a.seq - b.seq)
      : log;
  };

  const later = (fn, ms) => {
    const id = schedule(() => {
      timers.delete(id);
      fn();
    }, ms);
    timers.add(id);
  };

  const pump = () => {
    if (view.status !== "online" || sent !== null || retrying || !queue.length)
      return;
    sent = lastSeq() + 1;
    ws.send(JSON.stringify({ t: "event", seq: sent, event: queue[0] }));
  };

  // queue[0] was accepted when the log holds it at the seq it was sent with
  const settle = (seq) => {
    const held = view.log.find((e) => e.seq === seq);
    if (held && same(queue[0], held)) queue = queue.slice(1);
  };

  const handlers = {
    joined: ({ seats, presence }) => update({ seats, presence }),
    events: ({ events }) => caughtUp(merge(view.log, events)),
    snapshot: ({ events }) => caughtUp(merge([], events)),
    event: ({ event }) => {
      const log = merge(view.log, [event]);
      if (sent === event.seq && same(queue[0], event)) {
        queue = queue.slice(1);
        sent = null;
      }
      update({ log });
      pump();
    },
    presence: ({ users }) => update({ presence: users }),
    rebase: () => {
      // The seq was stale: catch up on a fresh socket and send it again
      sent = null;
      ws.close();
      connect();
    },
    error: ({ code, message }) => {
      if (code === "locked") {
        locked = true;
        queue = [];
        sent = null;
        return update({ status: "locked", error: code });
      }
      if (code === "bad_token" || code === "not_member")
        return update({ error: code });
      if (sent === null) return update({ error: message || code });
      sent = null;
      if (code === "rate_limited") {
        retrying = true;
        return later(() => {
          retrying = false;
          pump();
        }, 1000);
      }
      // Rejected for good (invalid, server_error): drop it and go on
      queue = queue.slice(1);
      update({ error: message || code });
      pump();
    },
  };

  const caughtUp = (log) => {
    view = { ...view, log };
    if (unsure !== null) settle(unsure);
    unsure = null;
    attempt = 0;
    update({ status: locked ? "locked" : "online" });
    pump();
  };

  function connect() {
    let socket;
    try {
      socket = new WebSocket(url);
    } catch (error) {
      return update({ status: "error", error: error.message });
    }
    ws = socket;
    socket.onopen = () => {
      if (ws !== socket || closed) return;
      socket.send(
        JSON.stringify({ t: "join", token, gameId, lastSeq: lastSeq() }),
      );
    };
    socket.onmessage = ({ data }) => {
      if (ws !== socket || closed) return;
      let msg;
      try {
        msg = JSON.parse(data);
      } catch {
        return;
      }
      if (msg && Object.hasOwn(handlers, msg.t)) handlers[msg.t](msg);
    };
    socket.onclose = ({ code }) => {
      if (ws !== socket || closed) return;
      unsure = sent ?? unsure;
      sent = null;
      if (code === DENIED) return update({ status: "denied" });
      update({ status: "offline" });
      later(connect, Math.min(1000 * 2 ** attempt++, MAX_DELAY));
    };
  }

  connect();

  return {
    subscribe: (listener) => {
      listeners.add(listener);
      listener(view);
      return () => listeners.delete(listener);
    },
    send: (event) => {
      const invalid = validateEvent(event);
      if (invalid) throw new Error(invalid);
      if (locked || closed || view.status === "denied") return;
      queue = [...queue, event];
      update({});
      pump();
    },
    close: () => {
      closed = true;
      for (const id of timers) cancel(id);
      timers.clear();
      ws?.close();
      listeners.clear();
    },
  };
};
