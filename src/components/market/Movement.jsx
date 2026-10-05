import { getMovementData } from "@/util/market";

// The legend of how the share price moves, as a compass around the price
const Movement = ({ movement, title }) => {
  const data = getMovementData(movement);
  const { arrows, extras, side, center, centerBox, pad } = data;
  const lh = data.lineHeight;
  const top = center.y - centerBox.height / 2;
  const bottom = center.y + centerBox.height / 2;
  const left = center.x - centerBox.width / 2;
  const right = center.x + centerBox.width / 2;
  const font = { fontFamily: "sans-serif", fontSize: 12, fill: "black" };

  const lines = (key, x, y, anchor = "start") =>
    arrows[key].length > 0 && (
      <text {...font} textAnchor={anchor} x={x}>
        {arrows[key].map((line, i) => (
          <tspan key={`${key}-${i}`} x={x} y={y + i * lh}>
            {line}
          </tspan>
        ))}
      </text>
    );
  // A line from the price box to a head pointing in the direction of the key
  const arrow = (key, x1, y1, x2, y2) => {
    const dx = Math.sign(x2 - x1);
    const dy = Math.sign(y2 - y1);
    const base = [x2 - dx * 8, y2 - dy * 8];
    const head = [
      [x2, y2],
      [base[0] - dy * 4, base[1] + dx * 4],
      [base[0] + dy * 4, base[1] - dx * 4],
    ];
    return (
      arrows[key].length > 0 && (
        <g>
          <line
            x1={x1}
            y1={y1}
            x2={base[0]}
            y2={base[1]}
            stroke="black"
            strokeWidth="1.5"
          />
          <polygon
            points={head.map((p) => p.join(",")).join(" ")}
            fill="black"
          />
        </g>
      )
    );
  };

  return (
    <g>
      <rect
        width={data.width}
        height={data.height}
        fill="white"
        stroke="black"
        strokeWidth="1.5"
      />
      <text
        {...font}
        fontFamily="display"
        fontStyle="bold"
        fontSize="16"
        textAnchor="middle"
        x={data.width / 2}
        y="20"
      >
        {title}
      </text>
      <rect
        x={left}
        y={top}
        width={centerBox.width}
        height={centerBox.height}
        fill="white"
        stroke="black"
        strokeWidth="1.5"
      />
      <text
        {...font}
        textAnchor="middle"
        dominantBaseline="middle"
        x={center.x}
        y={center.y}
      >
        Price
      </text>
      {arrow("up", center.x, top, center.x, top - (data.topHeight - 6))}
      {lines("up", center.x + 10, top - data.topHeight + 20)}
      {arrow(
        "down",
        center.x,
        bottom,
        center.x,
        bottom + (data.bottomHeight - 6),
      )}
      {lines("down", center.x + 10, bottom + 16)}
      {arrow("left", left, center.y, pad + 10, center.y)}
      {lines("left", pad, center.y - 6 - (arrows.left.length - 1) * lh)}
      {arrow("right", right, center.y, right + side.right - 10, center.y)}
      {lines("right", right + 6, center.y - 6 - (arrows.right.length - 1) * lh)}
      {extras.length > 0 && (
        <text {...font}>
          {extras.map((line, i) => (
            <tspan
              key={`extra-${i}`}
              x={pad}
              y={bottom + data.bottomHeight + 16 + i * lh}
            >
              {line}
            </tspan>
          ))}
        </text>
      )}
    </g>
  );
};

export default Movement;
