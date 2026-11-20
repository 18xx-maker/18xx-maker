import { createSession } from "@/play/client/socket";

const GAME = "00000000-0000-4000-8000-000000000000";
const note = (text) => ({ type: "note.set", text });
const ev = (seq, text, userId = "u2") => ({
  seq,
  userId,
  type: "note.set",
  text,
});

// A scripted WebSocket: the test opens it, feeds it frames and drops it
const setup = (options = {}) => {
  const sockets = [];
  class FakeSocket {
    constructor(url) {
      this.url = url;
      this.sent = [];
      this.closed = false;
      this.opened = false;
      sockets.push(this);
    }
    // Like a browser socket: sending while connecting or closed throws
    send(data) {
      if (!this.opened || this.closed) throw new Error("InvalidStateError");
      this.sent.push(JSON.parse(data));
    }
    close() {
      this.closed = true;
    }
    open() {
      this.opened = true;
      this.onopen?.();
    }
    receive(msg) {
      this.onmessage?.({ data: JSON.stringify(msg) });
    }
    drop(code = 1006) {
      this.onclose?.({ code });
    }
    events() {
      return this.sent.filter((m) => m.t === "event");
    }
  }

  const timers = [];
  const schedule = (fn, ms) => timers.push({ fn, ms, done: false });
  const cancel = (id) => {
    if (timers[id - 1]) timers[id - 1].done = true;
  };
  const runTimers = () => {
    for (const t of timers.filter((x) => !x.done)) {
      t.done = true;
      t.fn();
    }
  };

  const session = createSession({
    baseUrl: "https://s.test/",
    token: "tok",
    gameId: GAME,
    WebSocket: FakeSocket,
    schedule,
    cancel,
    ...options,
  });
  const snaps = [];
  session.subscribe((s) => snaps.push(s));
  const last = () => snaps[snaps.length - 1];
  const sock = () => sockets[sockets.length - 1];
  const pendingTimers = () => timers.filter((t) => !t.done);

  // Open the current socket and answer its join with a catch-up frame
  const join = (catchUp = { t: "events", events: [] }, seq = 0) => {
    sock().open();
    sock().receive({
      t: "joined",
      seq,
      seats: [{ userId: "u1", name: "A", color: "#f00" }],
      presence: ["u1"],
    });
    sock().receive(catchUp);
  };

  return {
    session,
    sockets,
    sock,
    last,
    join,
    timers,
    pendingTimers,
    runTimers,
  };
};

describe("play websocket session", () => {
  it("connects to the ws url of the server and joins with lastSeq 0", () => {
    const { sock, last } = setup();
    expect(sock().url).toBe("wss://s.test/ws");
    expect(last().status).toBe("connecting");
    sock().open();
    expect(sock().sent).toEqual([
      { t: "join", token: "tok", gameId: GAME, lastSeq: 0 },
    ]);
  });

  it("uses ws for an http server", () => {
    const { sock } = setup({ baseUrl: "http://localhost:8787" });
    expect(sock().url).toBe("ws://localhost:8787/ws");
  });

  it("fills the log from joined and events and goes online", () => {
    const { join, last } = setup();
    join({ t: "events", events: [ev(2, "b"), ev(1, "a")] }, 2);
    expect(last()).toMatchObject({
      status: "online",
      seats: [{ userId: "u1", name: "A", color: "#f00" }],
      presence: ["u1"],
      pending: 0,
    });
    expect(last().log.map((e) => e.seq)).toEqual([1, 2]);
  });

  it("numbers sends from the highest seq held, not joined.seq", () => {
    const { join, session, sock } = setup();
    // joined says 9 but only 1..3 arrived: the next event is 4
    join({ t: "events", events: [ev(1, "a"), ev(2, "b"), ev(3, "c")] }, 9);
    session.send(note("x"));
    expect(sock().events()).toEqual([{ t: "event", seq: 4, event: note("x") }]);
  });

  it("ignores a live event for a seq it already holds", () => {
    const { join, sock, last } = setup();
    join({ t: "events", events: [ev(1, "a")] }, 1);
    sock().receive({ t: "event", event: ev(1, "dup") });
    sock().receive({ t: "event", event: ev(2, "b") });
    sock().receive({ t: "event", event: ev(2, "b") });
    expect(last().log).toEqual([ev(1, "a"), ev(2, "b")]);
  });

  it("replaces the whole log on a snapshot frame", () => {
    const { join, sock, last } = setup();
    join({ t: "events", events: [ev(1, "a"), ev(2, "b"), ev(3, "c")] }, 3);
    sock().receive({ t: "snapshot", seq: 0, state: {}, events: [ev(1, "z")] });
    expect(last().log).toEqual([ev(1, "z")]);
  });

  it("applies a sent event only when the server echoes it", () => {
    const { join, session, sock, last } = setup();
    join({ t: "events", events: [ev(1, "a")] }, 1);
    session.send(note("x"));
    expect(sock().events()).toEqual([{ t: "event", seq: 2, event: note("x") }]);
    expect(last().log).toHaveLength(1);
    expect(last().pending).toBe(1);
    sock().receive({ t: "event", event: ev(2, "x", "u1") });
    expect(last().log.map((e) => e.seq)).toEqual([1, 2]);
    expect(last().pending).toBe(0);
  });

  it("throws on an invalid event and sends nothing", () => {
    const { join, session, sock } = setup();
    join();
    expect(() => session.send({ type: "nope" })).toThrow(/unknown event type/);
    expect(sock().events()).toEqual([]);
  });

  it("gives two rapid sends seq n+1 and n+2 in order", () => {
    const { join, session, sock, last } = setup();
    join({ t: "events", events: [ev(1, "a")] }, 1);
    session.send(note("x"));
    session.send(note("y"));
    expect(last().pending).toBe(2);
    // one on the wire at a time, so a conflict can never reorder them
    expect(sock().events()).toEqual([{ t: "event", seq: 2, event: note("x") }]);
    sock().receive({ t: "event", event: ev(2, "x", "u1") });
    expect(sock().events()).toEqual([
      { t: "event", seq: 2, event: note("x") },
      { t: "event", seq: 3, event: note("y") },
    ]);
    sock().receive({ t: "event", event: ev(3, "y", "u1") });
    expect(last().pending).toBe(0);
    expect(last().log.map((e) => e.text)).toEqual(["a", "x", "y"]);
  });

  it("catches up on rebase and resends the unechoed event once", () => {
    const { join, session, sockets, sock, last } = setup();
    join({ t: "events", events: [ev(1, "a")] }, 1);
    session.send(note("x"));
    const first = sock();
    // another player took seq 2 and the echo has not reached this socket
    first.receive({ t: "rebase", currentSeq: 2 });
    expect(first.closed).toBe(true);
    expect(sockets).toHaveLength(2);
    sock().open();
    expect(sock().sent).toEqual([
      { t: "join", token: "tok", gameId: GAME, lastSeq: 1 },
    ]);
    sock().receive({ t: "joined", seq: 2, seats: [], presence: [] });
    sock().receive({ t: "events", events: [ev(2, "other")] });
    expect(sock().events()).toEqual([{ t: "event", seq: 3, event: note("x") }]);
    // frames of the old socket are ignored
    first.receive({ t: "event", event: ev(9, "stale") });
    first.drop();
    expect(sockets).toHaveLength(2);
    sock().receive({ t: "event", event: ev(3, "x", "u1") });
    expect(last().log.map((e) => e.text)).toEqual(["a", "other", "x"]);
    expect(last().pending).toBe(0);
  });

  it("sends nothing between a rebase and its catch-up, in order", () => {
    const { join, session, sock, last, runTimers } = setup();
    join({ t: "events", events: [ev(1, "a")] }, 1);
    session.send(note("x"));
    sock().receive({ t: "error", code: "rate_limited" });
    sock().receive({ t: "rebase", currentSeq: 2 });
    expect(last().status).toBe("connecting");
    // a send and the rate limit retry while the new socket connects
    session.send(note("y"));
    runTimers();
    sock().open();
    session.send(note("z"));
    sock().receive({ t: "joined", seq: 2, seats: [], presence: [] });
    expect(sock().sent).toEqual([
      { t: "join", token: "tok", gameId: GAME, lastSeq: 1 },
    ]);
    sock().receive({ t: "events", events: [ev(2, "other")] });
    expect(sock().events()).toEqual([{ t: "event", seq: 3, event: note("x") }]);
    sock().receive({ t: "event", event: ev(3, "x", "u1") });
    sock().receive({ t: "event", event: ev(4, "y", "u1") });
    sock().receive({ t: "event", event: ev(5, "z", "u1") });
    expect(
      sock()
        .events()
        .map((m) => [m.seq, m.event.text]),
    ).toEqual([
      [3, "x"],
      [4, "y"],
      [5, "z"],
    ]);
    expect(last().pending).toBe(0);
  });

  it("sends nothing while offline", () => {
    const { join, session, sock, last } = setup();
    join();
    sock().drop();
    expect(() => session.send(note("x"))).not.toThrow();
    expect(last().pending).toBe(1);
  });

  it("matches its echo by userId when given one", () => {
    const { join, session, sock, last } = setup({ userId: "u1" });
    join();
    session.send(note("x"));
    // another player sent the identical event and won seq 1
    sock().receive({ t: "event", event: ev(1, "x", "u2") });
    expect(last().pending).toBe(1);
    sock().receive({ t: "rebase", currentSeq: 1 });
    sock().open();
    sock().receive({ t: "joined", seq: 1, seats: [], presence: [] });
    sock().receive({ t: "events", events: [] });
    expect(sock().events()).toEqual([{ t: "event", seq: 2, event: note("x") }]);
    sock().receive({ t: "event", event: ev(2, "x", "u1") });
    expect(last().pending).toBe(0);
    expect(last().log.map((e) => e.userId)).toEqual(["u2", "u1"]);
  });

  it("settles a dropped send by userId on catch-up", () => {
    const { join, session, sock, runTimers } = setup({ userId: "u1" });
    join();
    session.send(note("x"));
    sock().drop();
    runTimers();
    join({ t: "events", events: [ev(1, "x", "u2")] }, 1);
    expect(sock().events()).toEqual([{ t: "event", seq: 2, event: note("x") }]);
  });

  it("does not take another player's event at the sent seq as its echo", () => {
    const { join, session, sock, last } = setup();
    join({ t: "events", events: [] }, 0);
    session.send(note("x"));
    sock().receive({ t: "event", event: ev(1, "other") });
    expect(last().pending).toBe(1);
    sock().receive({ t: "rebase", currentSeq: 1 });
    sock().open();
    sock().receive({ t: "joined", seq: 1, seats: [], presence: [] });
    sock().receive({ t: "events", events: [] });
    expect(sock().sent).toContainEqual({
      t: "event",
      seq: 2,
      event: note("x"),
    });
  });

  it("is denied without reconnecting on close 4003", () => {
    const { sock, sockets, last, pendingTimers } = setup();
    sock().open();
    sock().receive({ t: "error", code: "not_member" });
    sock().drop(4003);
    expect(last()).toMatchObject({ status: "denied", error: "not_member" });
    expect(pendingTimers()).toEqual([]);
    expect(sockets).toHaveLength(1);
  });

  it("is denied on bad_token", () => {
    const { sock, last } = setup();
    sock().open();
    sock().receive({ t: "error", code: "bad_token" });
    sock().drop(4003);
    expect(last()).toMatchObject({ status: "denied", error: "bad_token" });
  });

  it("goes locked on a locked error and drops the queue", () => {
    const { join, session, sock, last } = setup();
    join();
    session.send(note("x"));
    sock().receive({ t: "error", code: "locked" });
    expect(last()).toMatchObject({ status: "locked", pending: 0 });
    session.send(note("y"));
    expect(sock().events()).toHaveLength(1);
    expect(last().pending).toBe(0);
  });

  it("stays locked after a reconnect", () => {
    const { join, session, sock, last, runTimers } = setup();
    join();
    session.send(note("x"));
    sock().receive({ t: "error", code: "locked" });
    sock().drop();
    runTimers();
    join();
    expect(last().status).toBe("locked");
  });

  it("keeps a rate limited event queued and retries after one second", () => {
    const { join, session, sock, last, pendingTimers, runTimers } = setup();
    join();
    session.send(note("x"));
    sock().receive({ t: "error", code: "rate_limited" });
    expect(last().pending).toBe(1);
    expect(pendingTimers().map((t) => t.ms)).toEqual([1000]);
    // a send while waiting does not jump the queue
    session.send(note("y"));
    expect(sock().events()).toHaveLength(1);
    runTimers();
    expect(sock().events()).toEqual([
      { t: "event", seq: 1, event: note("x") },
      { t: "event", seq: 1, event: note("x") },
    ]);
  });

  it("drops an event the server rejects as invalid and sends the next", () => {
    const { join, session, sock, last } = setup();
    join();
    session.send({ type: "undo", target: 5 });
    session.send(note("y"));
    sock().receive({ t: "error", code: "invalid", message: "bad undo" });
    expect(last()).toMatchObject({
      status: "online",
      pending: 1,
      error: "bad undo",
    });
    expect(sock().events()[1]).toEqual({
      t: "event",
      seq: 1,
      event: note("y"),
    });
  });

  it("reconnects with backoff 1s, 2s, 4s ... capped at 15s", () => {
    const { sock, last, pendingTimers, runTimers } = setup();
    const delays = [];
    for (let i = 0; i < 6; i++) {
      sock().drop();
      expect(last().status).toBe("offline");
      delays.push(...pendingTimers().map((t) => t.ms));
      runTimers();
    }
    expect(delays).toEqual([1000, 2000, 4000, 8000, 15000, 15000]);
  });

  it("resets the backoff once joined", () => {
    const { sock, join, pendingTimers, runTimers } = setup();
    sock().drop();
    runTimers();
    sock().drop();
    runTimers();
    join();
    sock().drop();
    expect(pendingTimers().map((t) => t.ms)).toEqual([1000]);
  });

  it("resends an unechoed event after catching up from a drop", () => {
    const { join, session, sock, last, runTimers } = setup();
    join({ t: "events", events: [ev(1, "a")] }, 1);
    session.send(note("x"));
    session.send(note("y"));
    sock().drop();
    expect(last()).toMatchObject({ status: "offline", pending: 2 });
    session.send(note("z"));
    runTimers();
    sock().open();
    expect(sock().sent[0]).toMatchObject({ t: "join", lastSeq: 1 });
    sock().receive({ t: "joined", seq: 1, seats: [], presence: [] });
    sock().receive({ t: "events", events: [] });
    expect(sock().events()).toEqual([{ t: "event", seq: 2, event: note("x") }]);
    expect(last().pending).toBe(3);
  });

  it("does not resend an event the catch-up shows was accepted", () => {
    const { join, session, sock, last, runTimers } = setup();
    join({ t: "events", events: [ev(1, "a")] }, 1);
    session.send(note("x"));
    session.send(note("y"));
    // accepted, but the echo was lost with the socket
    sock().drop();
    runTimers();
    join({ t: "events", events: [ev(2, "x", "u1")] }, 2);
    expect(sock().events()).toEqual([{ t: "event", seq: 3, event: note("y") }]);
    expect(last().pending).toBe(1);
    expect(last().log.map((e) => e.text)).toEqual(["a", "x"]);
  });

  it("replaces the log with a snapshot after a reconnect", () => {
    const { join, sock, last, runTimers } = setup();
    join({ t: "events", events: [ev(1, "a"), ev(2, "b"), ev(3, "c")] }, 3);
    sock().drop();
    runTimers();
    sock().open();
    expect(sock().sent[0]).toMatchObject({ lastSeq: 3 });
    sock().receive({ t: "joined", seq: 1, seats: [], presence: [] });
    sock().receive({ t: "snapshot", seq: 0, state: {}, events: [ev(1, "z")] });
    expect(last().log).toEqual([ev(1, "z")]);
    expect(last().status).toBe("online");
  });

  it("merges live and catch-up duplicates once", () => {
    const { join, sock, last, runTimers } = setup();
    join({ t: "events", events: [ev(1, "a")] }, 1);
    sock().receive({ t: "event", event: ev(2, "b") });
    sock().drop();
    runTimers();
    join({ t: "events", events: [ev(2, "b"), ev(3, "c")] }, 3);
    sock().receive({ t: "event", event: ev(3, "c") });
    expect(last().log.map((e) => e.seq)).toEqual([1, 2, 3]);
  });

  it("updates presence", () => {
    const { join, sock, last } = setup();
    join();
    sock().receive({ t: "presence", users: ["u1", "u2"] });
    expect(last().presence).toEqual(["u1", "u2"]);
  });

  it("stops reconnecting and cancels timers on close", () => {
    const { session, sock, sockets, pendingTimers, runTimers } = setup();
    sock().drop();
    expect(pendingTimers()).toHaveLength(1);
    session.close();
    expect(pendingTimers()).toEqual([]);
    runTimers();
    expect(sockets).toHaveLength(1);
  });

  it("closes the socket on close and ignores what follows", () => {
    const { session, join, sock, sockets, last } = setup();
    join();
    const count = last();
    session.close();
    expect(sock().closed).toBe(true);
    sock().receive({ t: "event", event: ev(1, "late") });
    sock().drop();
    expect(sockets).toHaveLength(1);
    expect(last()).toBe(count);
  });

  it("subscribe returns an unsubscribe", () => {
    const { session, sock } = setup();
    const seen = [];
    const off = session.subscribe((s) => seen.push(s.status));
    expect(seen).toEqual(["connecting"]);
    off();
    sock().drop();
    expect(seen).toEqual(["connecting"]);
  });
});
