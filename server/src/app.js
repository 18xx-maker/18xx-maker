import { createAdaptorServer } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";

import { authRoutes } from "./auth.js";
import { gameRoutes } from "./games.js";
import { attachHub } from "./hub.js";

export const createApp = ({ pool, config }) => {
  const app = new Hono();

  app.use(
    "*",
    cors({
      origin: (origin) =>
        config.allowedOrigins.includes(origin) ? origin : null,
      allowHeaders: ["Authorization", "Content-Type"],
      allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    }),
  );

  app.get("/health", (c) => c.json({ ok: true }));
  app.route("/", authRoutes({ pool, config }));
  app.route("/", gameRoutes({ pool, config }));

  return app;
};

// The HTTP server with the websocket hub on /ws; close() also drops the sockets
export const createServer = ({ pool, config }) => {
  const server = createAdaptorServer({
    fetch: createApp({ pool, config }).fetch,
  });
  const hub = attachHub(server, { pool, config });
  const close = server.close.bind(server);
  server.close = (callback) => {
    hub.close();
    return close(callback);
  };
  return server;
};
