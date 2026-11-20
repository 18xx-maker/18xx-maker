import { createAdaptorServer } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";

import { authRoutes } from "./auth.js";
import { gameRoutes } from "./games.js";
import { attachHub } from "./hub.js";
import { createNotifier } from "./webhook.js";

// sockets: the hub's { closeToken, closeGame, closeWatchers }, absent without a websocket hub
export const createApp = ({
  pool,
  config,
  sockets,
  notifier = createNotifier({ pool, config }),
}) => {
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
  app.route("/", gameRoutes({ pool, config, notifier, sockets }));

  return app;
};

// The HTTP server with the websocket hub on /ws; close() also drops the
// sockets and the pending webhook notices
export const createServer = ({ pool, config }) => {
  // The hub needs the server and the app needs the hub: requests only arrive
  // once the server listens, by then hub is set
  let hub;
  const sockets = {
    closeToken: (tokenHash) => hub.closeToken(tokenHash),
    closeGame: (gameId) => hub.closeGame(gameId),
    closeWatchers: (gameId) => hub.closeWatchers(gameId),
  };
  const notifier = createNotifier({ pool, config });
  const server = createAdaptorServer({
    fetch: createApp({ pool, config, sockets, notifier }).fetch,
  });
  hub = attachHub(server, { pool, config, notifier });
  const close = server.close.bind(server);
  server.close = (callback) => {
    hub.close();
    notifier.close();
    return close(callback);
  };
  return server;
};
