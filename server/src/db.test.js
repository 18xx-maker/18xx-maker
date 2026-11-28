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
