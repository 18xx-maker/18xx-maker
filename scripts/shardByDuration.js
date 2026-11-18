// Splits test files into shards of about equal run time: longest file first,
// each into the shard with the least time so far. Files without a timing get
// the median. Ties are broken by path and shard number, so every shard
// process computes the same split.
export function packShards(files, timings, count) {
  const known = Object.values(timings).sort((a, b) => a - b);
  const median = known.length ? known[Math.floor(known.length / 2)] : 1;
  const items = [...new Set(files)]
    .map((file) => ({ file, seconds: timings[file] ?? median }))
    .sort(
      (a, b) =>
        b.seconds - a.seconds ||
        (a.file < b.file ? -1 : a.file > b.file ? 1 : 0),
    );
  const shards = Array.from({ length: count }, () => ({
    files: [],
    seconds: 0,
  }));
  for (const item of items) {
    const shard = shards.reduce((min, s) =>
      s.seconds < min.seconds ? s : min,
    );
    shard.files.push(item.file);
    shard.seconds += item.seconds;
  }
  return shards;
}
