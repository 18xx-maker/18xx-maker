import { vi } from "vitest";

export const BASE = "http://play.test";

// A fake play server for the global fetch: handlers by "METHOD /path" are
// [status, body] pairs or functions of the request returning one. A request
// with no handler is a 404.
export const fakeServer = (handlers) => {
  const fetch = vi.fn(async (url, init = {}) => {
    const key = `${init.method || "GET"} ${String(url).replace(BASE, "")}`;
    const handler = handlers[key];
    const [status, body] = handler
      ? typeof handler === "function"
        ? handler(init)
        : handler
      : [404, { error: "Not found" }];
    return new Response(body === undefined ? null : JSON.stringify(body), {
      status,
      headers: { "Content-Type": "application/json" },
    });
  });
  vi.stubGlobal("fetch", fetch);
  return fetch;
};

export const calls = (fetch, method, path) =>
  fetch.mock.calls.filter(
    ([url, init]) =>
      (init?.method || "GET") === method && String(url) === BASE + path,
  );

// The public routes of a spectator link: its game as GET /watch/:code/game
// gives it (no owner, invite or webhook) and its title
export const watchRoutes = (code, record) => {
  const path = `/watch/${encodeURIComponent(code)}`;
  return {
    [`GET ${path}`]: [200, { gameId: record.id, title: record.title }],
    [`GET ${path}/game`]: [200, record],
  };
};
