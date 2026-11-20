import { createAdaptorServer } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";

import { authRoutes } from "./auth.js";
import { gameRoutes } from "./games.js";
import { attachHub } from "./hub.js";

// sockets: the hub's { closeToken, closeGame }, absent without a websocket hub
export const createApp = ({ pool, config, sockets }) => {
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
  app.route("/", authRoutes({ pool, config, sockets }));
  app.route("/", gameRoutes({ pool, config }));

  return app;
};

// The HTTP server with the websocket hub on /ws; close() also drops the sockets
export const createServer = ({ pool, config }) => {
  // The hub needs the server and the app needs the hub: requests only arrive
  // once the server listens, by then hub is set
  let hub;
  const sockets = {
    closeToken: (tokenHash) => hub.closeToken(tokenHash),
    closeGame: (gameId) => hub.closeGame(gameId),
  };
  const server = createAdaptorServer({
    fetch: createApp({ pool, config, sockets }).fetch,
  });
  hub = attachHub(server, { pool, config });
  const close = server.close.bind(server);
  server.close = (callback) => {
    hub.close();
    return close(callback);
  };
  return server;
};
