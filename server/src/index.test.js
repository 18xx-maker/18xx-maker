import { describe, expect, it } from "vitest";

describe("index", () => {
  it("does not start a server when imported", async () => {
    const before = process.getActiveResourcesInfo().length;
    const { main } = await import("./index.js");
    expect(typeof main).toBe("function");
    expect(process.getActiveResourcesInfo().length).toBe(before);
  });
});
