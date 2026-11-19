import { packShards } from "./shardByDuration.js";

const timings = { a: 10, b: 8, c: 6, d: 5, e: 4, f: 3, g: 2, h: 1 };
const files = Object.keys(timings);

describe("packShards", () => {
  it("puts every file in exactly one shard", () => {
    const shards = packShards([...files, "unknown"], timings, 3);
    const all = shards.flatMap((s) => s.files);
    expect(all.sort()).toEqual([...files, "unknown"].sort());
  });

  it("gives the same split for any input order", () => {
    const a = packShards(files, timings, 3);
    const b = packShards([...files].reverse(), timings, 3);
    expect(b).toEqual(a);
  });

  it("gives unknown files the median timing", () => {
    const shards = packShards(["x", "y"], { a: 1, b: 5, c: 9 }, 2);
    expect(shards.map((s) => s.seconds)).toEqual([5, 5]);
  });

  it("handles no timings at all", () => {
    const shards = packShards(["x", "y", "z"], {}, 2);
    expect(shards.flatMap((s) => s.files).sort()).toEqual(["x", "y", "z"]);
  });

  it("balances the shards", () => {
    const shards = packShards(files, timings, 3);
    expect(shards.map((s) => s.seconds)).toEqual([13, 13, 13]);
  });

  it("leaves a shard empty when there are fewer files than shards", () => {
    const shards = packShards(["a"], timings, 2);
    expect(shards.map((s) => s.files)).toEqual([["a"], []]);
  });
});
