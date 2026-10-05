// A stadium for two towns or cities side by side: two half circles of radius
// rx and ry, joined by straight edges. `inset` pulls the straight edges in.
export const stadiumPath = (rx, ry, inset = 0) =>
  `M${rx - inset},${ry} A${rx},${ry} 0 1,0 ${rx - inset},-${ry} L-${rx - inset},-${ry} A${rx},${ry} 0 1,0 -${rx - inset},${ry} L${rx - inset},${ry}`;

// The outline and the fill of a center town. `key` names the pair.
export const centerTownCircles = (c, { key, cx, r, color }) => [
  <g key={`${key}-outline`}>
    <circle fill={c("centerTown")} stroke="none" cx={cx} cy="0" r={r + 2} />
  </g>,
  <g key={`${key}-fill`}>
    <circle
      fill={c(color || "centerTown")}
      stroke="none"
      cx={cx}
      cy="0"
      r={r}
    />
  </g>,
];
