import { spawn } from "node:child_process";
import { randomBytes } from "node:crypto";
import net from "node:net";
import path from "node:path";
import { fileURLToPath } from "node:url";

import pg from "pg";
import { describe, expect, it, vi } from "vitest";

import { hasDb } from "../test/db.js";

const entry = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "index.js",
);

const freePort = () =>
  new Promise((resolve) => {
    const s = net.createServer().listen(0, "127.0.0.1", () => {
      const { port } = s.address();
      s.close(() => resolve(port));
    });
  });

describe("index", () => {
  it("does not start a server when imported", async () => {
    // A listening server is a TCPServerWrap; the runner's own pipes and timers come and go
    const live = () =>
      process.getActiveResourcesInfo().filter((r) => r === "TCPServerWrap")
        .length;
    const before = live();
    const { main } = await import("./index.js");
    expect(typeof main).toBe("function");
    expect(live()).toBe(before);
  });

  it.skipIf(!hasDb)(
    "exits 0 on SIGTERM after closing everything",
    async () => {
      const schema = `t_${randomBytes(6).toString("hex")}`;
      const admin = new pg.Pool({
        connectionString: process.env.DATABASE_URL,
        max: 1,
      });
      await admin.query(`create schema ${schema}`);
      const url = new URL(process.env.DATABASE_URL);
      url.searchParams.set("options", `-c search_path=${schema}`);
      const port = await freePort();
      const child = spawn(process.execPath, [entry], {
        env: {
          PATH: process.env.PATH,
          DATABASE_URL: url.href,
          PUBLIC_URL: "http://play.test",
          DISCORD_CLIENT_ID: "cid",
          DISCORD_CLIENT_SECRET: "secret",
          PORT: String(port),
        },
        stdio: "ignore",
      });
      const exited = new Promise((resolve) =>
        child.on("exit", (code, signal) => resolve({ code, signal })),
      );
      try {
        await vi.waitFor(
          async () => {
            const res = await fetch(`http://127.0.0.1:${port}/health`);
            expect(res.status).toBe(200);
          },
          { timeout: 8000, interval: 100 },
        );
        child.kill("SIGTERM");
        expect(await exited).toEqual({ code: 0, signal: null });
      } finally {
        child.kill("SIGKILL");
        await admin.query(`drop schema ${schema} cascade`);
        await admin.end();
      }
    },
    15000,
  );
});
