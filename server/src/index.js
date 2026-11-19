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
  return server;
};

// Only start when run directly, never when imported (tests)
if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
