import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import pg from "pg";

const MIGRATIONS = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "migrations",
);

export const createPool = (databaseUrl) =>
  new pg.Pool({ connectionString: databaseUrl });

export const migrate = async (pool) => {
  const names = (await fs.readdir(MIGRATIONS))
    .filter((f) => f.endsWith(".sql"))
    .sort();
  const applied = [];

  const client = await pool.connect();
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
    client.release();
  }
  return applied;
};
