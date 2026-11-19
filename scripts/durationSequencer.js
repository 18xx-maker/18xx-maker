import { readFileSync } from "node:fs";
import path from "node:path";

import { BaseSequencer } from "vitest/node";

import { packShards } from "./shardByDuration.js";

// `--shard` by measured duration (tests/timings.json, refreshed with
// scripts/test-timings.mjs) instead of vitest's split by file hash. Vitest
// calls shard() once with the files of every project, so the split is
// balanced over unit and component tests together.
export default class DurationSequencer extends BaseSequencer {
  async shard(specs) {
    const { root, shard } = this.ctx.config;
    const timings = JSON.parse(
      readFileSync(path.join(root, "tests/timings.json"), "utf8"),
    );
    const key = (spec) =>
      path.relative(root, spec.moduleId).split(path.sep).join("/");
    const shards = packShards(specs.map(key), timings, shard.count);
    const mine = new Set(shards[shard.index - 1].files);
    return specs.filter((spec) => mine.has(key(spec)));
  }
}
