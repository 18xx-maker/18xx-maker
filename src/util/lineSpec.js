// Selected lines of the JSON editor in the `lines` query parameter:
// comma separated tokens, each `N` or `A-B`, 1-based ("1-4,15,16,19"). A set
// of lines is a sorted list of merged, inclusive ranges: [[1, 4], [15, 16]].

// More tokens than this in a link are ignored
const MAX_TOKENS = 200;

const merge = (ranges) => {
  const sorted = [...ranges].sort((a, b) => a[0] - b[0]);
  const merged = [];
  for (const [from, to] of sorted) {
    const last = merged[merged.length - 1];
    if (last && from <= last[1] + 1) last[1] = Math.max(last[1], to);
    else merged.push([from, to]);
  }
  return merged;
};

// Tolerant: junk tokens are dropped, a reversed range is swapped, lines below
// 1 are dropped
export const parseLines = (spec) => {
  if (typeof spec !== "string") return [];
  const ranges = [];
  for (const token of spec.split(",").slice(0, MAX_TOKENS)) {
    const match = /^\s*(\d{1,9})\s*(?:-\s*(\d{1,9})\s*)?$/.exec(token);
    if (!match) continue;
    const a = Number(match[1]);
    const b = match[2] === undefined ? a : Number(match[2]);
    const [from, to] = a <= b ? [a, b] : [b, a];
    if (to < 1) continue;
    ranges.push([Math.max(from, 1), to]);
  }
  return merge(ranges);
};

// The canonical text of a set: merged, sorted, only digits, "-" and ","
export const formatLines = (ranges) =>
  ranges
    .map(([from, to]) => (from === to ? `${from}` : `${from}-${to}`))
    .join(",");

export const hasLine = (ranges, line) =>
  ranges.some(([from, to]) => line >= from && line <= to);

export const firstLine = (ranges) => ranges[0]?.[0];

export const sameLines = (a, b) => formatLines(a) === formatLines(b);

// Adds the line, or removes it when it is in the set
export const toggleLine = (ranges, line) => {
  if (!hasLine(ranges, line)) return merge([...ranges, [line, line]]);
  const next = [];
  for (const [from, to] of ranges) {
    if (line < from || line > to) next.push([from, to]);
    else {
      if (from < line) next.push([from, line - 1]);
      if (line < to) next.push([line + 1, to]);
    }
  }
  return next;
};

// The range between the first selected line (or the line itself when nothing
// is selected) and the line: replaces the set, or is added to it
export const extendTo = (ranges, line, add = false) => {
  const anchor = firstLine(ranges) ?? line;
  const range = [Math.min(anchor, line), Math.max(anchor, line)];
  return merge(add ? [...ranges, range] : [range]);
};
