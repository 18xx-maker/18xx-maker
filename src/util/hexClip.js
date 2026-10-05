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

const hexClip = (removeBorders = []) => {
  const apothem = Array.from({ length: 6 }, (_, k) =>
    removeBorders.includes((k + 3) % 6 || 6) ? OUTSET : INSET,
  );
  return Array.from({ length: 6 }, (_, k) => {
    // Vertex k is where edge k - 1 meets edge k
    const [x1, y1] = normal((k + 5) % 6);
    const [x2, y2] = normal(k);
    const a1 = apothem[(k + 5) % 6];
    const a2 = apothem[k];
    const det = x1 * y2 - x2 * y1;
    return `${round((a1 * y2 - a2 * y1) / det)},${round((x1 * a2 - x2 * a1) / det)}`;
  }).join(" ");
};

export default hexClip;
