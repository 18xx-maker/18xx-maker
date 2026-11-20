import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import pg from "pg";

const MIGRATIONS = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "migrations",
);

export const createPool = (databaseUrl) => {
  const pool = new pg.Pool({ connectionString: databaseUrl });
  // An idle client dropped by Postgres emits here; unhandled it kills the process
  pool.on("error", (err) => console.error("pg pool:", err.message));
  return pool;
};

// Held for the whole run, so two servers starting at once apply each file once
const MIGRATE_LOCK = 1808_7001;

export const migrate = async (pool) => {
  const names = (await fs.readdir(MIGRATIONS))
    .filter((f) => f.endsWith(".sql"))
    .sort();
  const applied = [];

  const client = await pool.connect();
  try {
    await client.query("select pg_advisory_lock($1)", [MIGRATE_LOCK]);
  } catch (error) {
    client.release();
    throw error;
  }
  try {
    await client.query(
      "create table if not exists schema_migrations (name text primary key)",
    );
    for (const name of names) {
      const done = await client.query(
        "select 1 from schema_migrations where name = $1",
        [name],
      );
      if (done.rowCount) continue;

      const sql = await fs.readFile(path.join(MIGRATIONS, name), "utf8");
      try {
        await client.query("begin");
        await client.query(sql);
        await client.query("insert into schema_migrations (name) values ($1)", [
          name,
        ]);
        await client.query("commit");
      } catch (error) {
        await client.query("rollback");
        throw error;
      }
      applied.push(name);
    }
  } finally {
    // A failed unlock means a broken connection: drop it, the lock goes with it
    const unlocked = await client
      .query("select pg_advisory_unlock($1)", [MIGRATE_LOCK])
      .then(
        () => true,
        () => false,
      );
    client.release(!unlocked);
  }
  return applied;
};
