import WebSocket from "ws";

// A websocket client that queues every frame so tests can await them in order
export const connect = (url) => {
  const ws = new WebSocket(url);
  const queue = [];
  const waiters = [];
  let closed = null;

  const flush = () => {
    for (let i = 0; i < waiters.length; i++) {
      const w = waiters[i];
      const at = queue.findIndex((m) => m.t === w.type);
      if (at >= 0) {
        waiters.splice(i--, 1);
        w.resolve(queue.splice(at, 1)[0]);
      } else if (closed) {
        waiters.splice(i--, 1);
        w.reject(new Error(`closed (${closed.code}) waiting for ${w.type}`));
      }
    }
  };

  ws.on("message", (data) => {
    queue.push(JSON.parse(data.toString()));
    flush();
  });

  const closedPromise = new Promise((resolve) => {
    ws.on("close", (code, reason) => {
      closed = { code, reason: reason.toString() };
      flush();
      resolve(closed);
    });
  });
  ws.on("error", () => {});

  const opened = new Promise((resolve, reject) => {
    ws.once("open", resolve);
    ws.once("error", reject);
  });

  return {
    opened,
    send: async (obj) => {
      await opened;
      ws.send(typeof obj === "string" ? obj : JSON.stringify(obj));
    },
    // Resolves with the first queued (or next) frame of this type
    next: (type) =>
      new Promise((resolve, reject) => {
        waiters.push({ type, resolve, reject });
        flush();
      }),
    // Every frame received so far that no next() has taken
    pending: () => [...queue],
    closed: closedPromise,
    close: () => {
      ws.close();
      return closedPromise;
    },
  };
};
