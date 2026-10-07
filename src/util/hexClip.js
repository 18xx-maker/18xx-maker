// Clip polygon for a hex whose content is clipped 0.5 inside its edge (apothem
// 74.5). A side whose border is removed is pushed out to 75.5 (past the true
// edge) so the fills of two neighbouring hexes overlap instead of leaving a
// gap that shows the page background.
const INSET = 74.5;
const OUTSET = 75.5;
const round = (n) => Math.round(n * 1e4) / 1e4 + 0;

// Side numbers follow HexBorder: side s is the edge between vertices
// (s + 3) % 6 and (s + 4) % 6, whose normal points at 210 + 60k degrees.
const normal = (k) => {
  const a = ((210 + 60 * k) * Math.PI) / 180;
  return [Math.cos(a), Math.sin(a)];
};

// The page direction each half points at
const PAGE = { top: [0, -1], bottom: [0, 1], left: [-1, 0], right: [1, 0] };
export const HALVES = Object.keys(PAGE);

// The unit vector of a half in the frame of the hex, which the page turns by
// `rotation` degrees (the inverse turn takes a page direction into it).
export const halfDirection = (half, rotation = 0) => {
  const [px, py] = PAGE[half];
  const a = (rotation * Math.PI) / 180;
  return [
    px * Math.cos(a) + py * Math.sin(a),
    -px * Math.sin(a) + py * Math.cos(a),
  ];
};

// Keep the part of a polygon on the side of `dir` of the center line (the
// points p with p . dir >= 0): one pass of Sutherland-Hodgman.
const cut = (points, [dx, dy]) => {
  const side = ([x, y]) => {
    const d = x * dx + y * dy;
    return Math.abs(d) < 1e-9 ? 0 : d;
  };
  return points.flatMap((p, i) => {
    const q = points[(i + 1) % points.length];
    const [sp, sq] = [side(p), side(q)];
    const out = sp >= 0 ? [p] : [];
    if (sp * sq < 0) {
      const t = sp / (sp - sq);
      out.push([p[0] + t * (q[0] - p[0]), p[1] + t * (q[1] - p[1])]);
    }
    return out;
  });
};

// The polygon (a big square cut down) that holds the halves, to clip anything
// bigger than the hex, like its border
export const halvesPolygon = (halves, rotation = 0) =>
  halves
    .reduce(
      (points, half) => cut(points, halfDirection(half, rotation)),
      [
        [-200, -200],
        [200, -200],
        [200, 200],
        [-200, 200],
      ],
    )
    .map(([x, y]) => `${round(x)},${round(y)}`)
    .join(" ");

// `halves` is a list of "top", "bottom", "left" or "right": only the part of
// the hex on those sides of its center stays (page directions, `rotation` is
// the turn of the hexes). Together they intersect, so two make a quarter.
const hexClip = (removeBorders = [], halves = [], rotation = 0) => {
  const apothem = Array.from({ length: 6 }, (_, k) =>
    removeBorders.includes((k + 3) % 6 || 6) ? OUTSET : INSET,
  );
  let points = Array.from({ length: 6 }, (_, k) => {
    // Vertex k is where edge k - 1 meets edge k
    const [x1, y1] = normal((k + 5) % 6);
    const [x2, y2] = normal(k);
    const a1 = apothem[(k + 5) % 6];
    const a2 = apothem[k];
    const det = x1 * y2 - x2 * y1;
    return [(a1 * y2 - a2 * y1) / det, (x1 * a2 - x2 * a1) / det];
  });
  for (const half of halves) {
    points = cut(points, halfDirection(half, rotation));
  }
  return points.map(([x, y]) => `${round(x)},${round(y)}`).join(" ");
};

export default hexClip;
