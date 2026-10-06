// Geometry of the track drawn by src/components/atoms/Track.jsx, in the frame
// of a hex side 1 (the track starts at the bottom, 75px from the center).
// Pure (no React) so positions can name points on track.

export const SIXTY_DEGREES = (60 * Math.PI) / 180; // Into Radians
export const ONE_TWENTY_DEGREES = (120 * Math.PI) / 180; // Into Radians

export const CENTER_EDGE_X = 0;
export const CENTER_EDGE_Y = 75;
export const SHARP_RADIUS = 43.31025;
export const GENTLE_RADIUS = 129.90375;

export const arcPosition = (percent, radius, arcAngle, xOffset) => {
  let angle = percent * arcAngle;
  let x = CENTER_EDGE_X + xOffset - radius + radius * Math.cos(angle);
  let y = CENTER_EDGE_Y - radius * Math.sin(angle);
  return [x, y];
};

// How each track type is drawn: its radius, the angle it turns through, and
// the angle (in degrees, mod 180) a bar perpendicular to it at the midpoint
// is rotated by.
const TRACK = {
  straight: { perpendicular: 0 },
  sharp: {
    radius: SHARP_RADIUS,
    arcAngle: ONE_TWENTY_DEGREES,
    perpendicular: 120,
  },
  gentle: {
    radius: GENTLE_RADIUS,
    arcAngle: SIXTY_DEGREES,
    perpendicular: 150,
  },
};

const round = (n, places) => {
  const f = 10 ** places;
  return Math.round(n * f) / f;
};

// The midpoint of a track as a position: `angle` is clockwise from the
// bottom (side 1) and `percent` the fraction of the 75px apothem. `side`
// rotates it like a track that starts on that side. With `align`
// the result also has the `rotation` that makes content sit perpendicular or
// parallel to the track there.
export const namedPosition = (mid, side = 1, align) => {
  const track = TRACK[mid];
  if (!track) return null;

  let angle = 0;
  let percent = 0;
  if (track.radius) {
    const [x, y] = arcPosition(0.5, track.radius, track.arcAngle, 0);
    percent = round(Math.hypot(x, y) / CENTER_EDGE_Y, 3);
    angle = Math.round((Math.atan2(-x, y) * 180) / Math.PI);
  }

  const turn = ((side || 1) - 1) * 60;
  const result = { angle: (angle + turn) % 360, percent };

  if (align) {
    const base = track.perpendicular + (align === "parallel" ? 90 : 0);
    result.rotation = (base + turn) % 360;
  }
  return result;
};
