import { Hono } from "hono";
import { cors } from "hono/cors";

import { authRoutes } from "./auth.js";
import { gameRoutes } from "./games.js";

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
