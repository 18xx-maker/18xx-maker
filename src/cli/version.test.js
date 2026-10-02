import fs from "node:fs";
import path from "node:path";

import version from "#cli/version";

describe("cli version", () => {
  it("is the package version", () => {
    const pkg = JSON.parse(
      fs.readFileSync(
        path.join(import.meta.dirname, "../../package.json"),
        "utf-8",
      ),
    );
    expect(version).toBe(pkg.version);
    expect(version).toMatch(/^\d+\.\d+\.\d+/);
  });
});
