import { randomBytes } from "node:crypto";

import pg from "pg";

import { migrate } from "../src/db.js";

const url = process.env.DATABASE_URL;

if (process.env.CI && !url) {
  throw new Error("DATABASE_URL must be set in CI so the server tests run");
}

export const hasDb = Boolean(url);

// A schema per call keeps test files independent of each other; migrate:
// false leaves it empty
export const makeTestDb = async ({ migrate: run = true } = {}) => {
  const schema = `t_${randomBytes(6).toString("hex")}`;

  const admin = new pg.Pool({ connectionString: url, max: 1 });
  await admin.query(`create schema ${schema}`);
  await admin.end();

  const pool = new pg.Pool({
    connectionString: url,
    options: `-c search_path=${schema},public`,
  });
  if (run) await migrate(pool);

  return {
    pool,
    schema,
    close: async () => {
      await pool.query(`drop schema ${schema} cascade`);
      await pool.end();
    },
  };
};
