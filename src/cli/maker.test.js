import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const bin = path.join(import.meta.dirname, "../../bin/maker.js");

// Runs the real CLI in an empty folder
const maker = (...args) => {
  const cwd = fs.mkdtempSync(path.join(os.tmpdir(), "18xx-cli-maker-"));
  try {
    return spawnSync(process.execPath, [bin, ...args], {
      cwd,
      encoding: "utf-8",
    });
  } finally {
    fs.rmSync(cwd, { recursive: true, force: true });
  }
};

describe("exit codes", () => {
  it("exits 0 for help and version", () => {
    expect(maker("--version").status).toBe(0);
    expect(maker("help").status).toBe(0);
  });

  it("exits 2 for an unknown command", () => {
    const result = maker("bogus");
    expect(result.status).toBe(2);
    expect(result.stderr).toContain("unknown command");
  });

  it("exits 2 for missing arguments", () => {
    expect(maker("b18", "18Test").status).toBe(2);
  });

  it("exits 2 for a game that does not exist", () => {
    const result = maker("print", "18Missing");
    expect(result.status).toBe(2);
    expect(result.stderr).toContain("Game 18Missing not found");
  });
});
