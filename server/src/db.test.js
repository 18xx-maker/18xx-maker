import fs from "node:fs/promises";

import { describe, expect, it, vi } from "vitest";

import { hasDb, makeTestDb } from "../test/db.js";
import { createPool, migrate } from "./db.js";

describe.skipIf(!hasDb)("migrate", () => {
  let db;
  beforeEach(async () => {
    db = await makeTestDb();
  });
  afterEach(() => db.close());

  it("creates every table", async () => {
    const { rows } = await db.pool.query(
      "select table_name from information_schema.tables where table_schema = $1",
      [db.schema],
    );
    const names = rows.map((r) => r.table_name);
    for (const t of [
      "users",
      "sessions",
      "games",
      "seats",
      "game_assets",
      "events",
      "snapshots",
      "schema_migrations",
    ]) {
      expect(names).toContain(t);
    }
  });

  it("is idempotent (second call returns [])", async () => {
    expect(await migrate(db.pool)).toEqual([]);
  });

  // The columns of 002 and whether watch_code has a unique index
  const extras = async () => {
    const { rows } = await db.pool.query(
      `select table_name, column_name, is_nullable, data_type
         from information_schema.columns
        where table_schema = $1
          and column_name in ('expires_at', 'webhook_url', 'watch_code')
        order by column_name`,
      [db.schema],
    );
    const unique = await db.pool.query(
      `select 1 from pg_index i
         join pg_class t on t.oid = i.indrelid
         join pg_namespace n on n.oid = t.relnamespace
         join pg_attribute a on a.attrelid = t.oid and a.attnum = any(i.indkey)
        where n.nspname = $1 and t.relname = 'games'
          and a.attname = 'watch_code' and i.indisunique and i.indnatts = 1`,
      [db.schema],
    );
    return { columns: rows, unique: unique.rowCount === 1 };
  };

  const EXTRAS = {
    columns: [
      {
        table_name: "sessions",
        column_name: "expires_at",
        is_nullable: "NO",
        data_type: "timestamp with time zone",
      },
      {
        table_name: "games",
        column_name: "watch_code",
        is_nullable: "YES",
        data_type: "text",
      },
      {
        table_name: "games",
        column_name: "webhook_url",
        is_nullable: "YES",
        data_type: "text",
      },
    ],
    unique: true,
  };

  it("adds expires_at, webhook_url and a unique watch_code", async () => {
    expect(await extras()).toEqual(EXTRAS);
  });

  it("002 runs again on a database that has all of it", async () => {
    await db.pool.query(
      "delete from schema_migrations where name = '002_extras.sql'",
    );
    expect(await migrate(db.pool)).toEqual(["002_extras.sql"]);
    expect(await extras()).toEqual(EXTRAS);
  });

  it("002 runs again over the unique constraint of its earlier version", async () => {
    await db.pool.query(
      `drop index games_watch_code_key;
       alter table games add constraint games_watch_code_key unique (watch_code)`,
    );
    await db.pool.query(
      "delete from schema_migrations where name = '002_extras.sql'",
    );
    expect(await migrate(db.pool)).toEqual(["002_extras.sql"]);
    expect(await extras()).toEqual(EXTRAS);
  });

  it("002 completes a database that applied an earlier version of it", async () => {
    // The first version of 002 only had expires_at
    await db.pool.query(
      "alter table games drop column webhook_url, drop column watch_code",
    );
    await db.pool.query(
      "delete from schema_migrations where name = '002_extras.sql'",
    );
    expect(await migrate(db.pool)).toEqual(["002_extras.sql"]);
    expect(await extras()).toEqual(EXTRAS);
  });
});

describe.skipIf(!hasDb)("concurrent migrate", () => {
  let db;
  beforeEach(async () => {
    db = await makeTestDb({ migrate: false });
  });
  afterEach(() => db.close());

  it("applies each file once when two run against one database", async () => {
    const files = (await fs.readdir(new URL("../migrations", import.meta.url)))
      .filter((f) => f.endsWith(".sql"))
      .sort();
    const results = await Promise.all([migrate(db.pool), migrate(db.pool)]);
    expect(results.flat().sort()).toEqual(files);
    const { rows } = await db.pool.query(
      "select name from schema_migrations order by name",
    );
    expect(rows.map((r) => r.name)).toEqual(files);
  });
});

describe.skipIf(!hasDb)("createPool", () => {
  it("absorbs an idle connection being dropped", async () => {
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    const pool = createPool(process.env.DATABASE_URL);
    const admin = createPool(process.env.DATABASE_URL);
    try {
      const client = await pool.connect();
      const { rows } = await client.query("select pg_backend_pid() as pid");
      client.release();
      await admin.query("select pg_terminate_backend($1)", [rows[0].pid]);
      await vi.waitFor(() => expect(log).toHaveBeenCalled());
      expect((await pool.query("select 1 as one")).rows[0].one).toBe(1);
    } finally {
      await pool.end();
      await admin.end();
      log.mockRestore();
    }
  });
});
