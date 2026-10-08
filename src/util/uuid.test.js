import { describe, expect, it } from "vitest";

import { isUUID } from "./uuid";

describe("isUUID", () => {
  it("accepts generated, uppercase, nil and max UUIDs", () => {
    const id = crypto.randomUUID();
    expect(isUUID(id)).toBe(true);
    expect(isUUID(id.toUpperCase())).toBe(true);
    expect(isUUID("00000000-0000-0000-0000-000000000000")).toBe(true);
    expect(isUUID("ffffffff-ffff-ffff-ffff-ffffffffffff")).toBe(true);
  });

  it("rejects other strings and non-strings", () => {
    expect(isUUID("my-game")).toBe(false);
    expect(isUUID("")).toBe(false);
    expect(isUUID("1b4e28ba-2fa1-11d2-883f-0016d3cca42")).toBe(false);
    expect(isUUID("1b4e28ba-2fa1-11d2-c83f-0016d3cca427")).toBe(false);
    for (const v of [undefined, null, 42, {}, []])
      expect(isUUID(v)).toBe(false);
  });
});
