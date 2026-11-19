import { pathToFileURL } from "node:url";

import { createServer } from "./app.js";
import { loadConfig } from "./config.js";
import { createPool, migrate } from "./db.js";

export const main = async (env = process.env) => {
  const config = loadConfig(env);
  const pool = createPool(config.databaseUrl);
  await migrate(pool);
  const server = createServer({ pool, config });
  server.listen(config.port, () => {
    console.log(`play server listening on ${config.port}`);
  });
  return { server, pool };
};

// Stop on SIGTERM/SIGINT: drop sockets, close the listener, end the pool
const shutdownOn = ({ server, pool }, signals = ["SIGTERM", "SIGINT"]) => {
  let stopping = false;
  const stop = async () => {
    if (stopping) return;
    stopping = true;
    setTimeout(() => process.exit(1), 5000).unref();
    try {
      await new Promise((resolve, reject) =>
        server.close((err) => (err ? reject(err) : resolve())),
      );
      await pool.end();
      process.exit(0);
    } catch (err) {
      console.error(err);
      process.exit(1);
    }
  };
  for (const signal of signals) process.on(signal, stop);
};

// Only start when run directly, never when imported (tests)
if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  main()
    .then(shutdownOn)
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
