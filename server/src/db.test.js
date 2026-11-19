import { hasDb, makeTestDb } from "../test/db.js";
import { migrate } from "./db.js";

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
