import { SIDES, sidePoint } from "@/components/hexEditor/hexModel";

import { cn } from "@/util/cn";

const point = (side, orientation, distance) => {
  const { x, y } = sidePoint(side, orientation, distance);
  return `${x.toFixed(2)},${y.toFixed(2)}`;
};

// The outline of a hex 150 across the flats, turned by the orientation
export const outline = (orientation = 0) =>
  SIDES.map((side) => point(side + 0.5, orientation, 86.6)).join(" ");

// The control of one side of a hex: a button on the edge, that a pointer hits
// along the whole edge and the keyboard reaches with Tab. `label` is what a
// screen reader says; `pressed` is whether the side is chosen.
export const SideHandle = ({
  side,
  orientation = 0,
  pressed,
  label,
  onPress,
  distance = 62,
  size = 11,
  hit = 26,
}) => {
  const center = sidePoint(side, orientation, distance);
  const from = sidePoint(side - 0.5, orientation, 86.6);
  const to = sidePoint(side + 0.5, orientation, 86.6);

  return (
    <g
      role="button"
      tabIndex={0}
      aria-label={label}
      aria-pressed={pressed}
      data-side={side}
      className="group cursor-pointer outline-none"
      onClick={(event) => {
        event.stopPropagation();
        onPress(side);
      }}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          event.stopPropagation();
          onPress(side);
        }
      }}
    >
      <line
        x1={from.x}
        y1={from.y}
        x2={to.x}
        y2={to.y}
        stroke="transparent"
        strokeWidth={hit}
        strokeLinecap="round"
      />
      <circle
        cx={center.x}
        cy={center.y}
        r={size}
        strokeWidth={2}
        className={cn(
          "stroke-foreground group-hover:stroke-primary group-focus-visible:stroke-ring group-focus-visible:[stroke-width:4px]",
          pressed ? "fill-primary" : "fill-background",
        )}
      />
      <text
        x={center.x}
        y={center.y}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={size * 1.1}
        fontFamily="sans-serif"
        pointerEvents="none"
        className={pressed ? "fill-primary-foreground" : "fill-foreground"}
      >
        {side}
      </text>
    </g>
  );
};

// Chooses sides of a hex on a drawing of it. With max 1 the side clicked is the
// side; with more, a click adds the side, or takes it away when it was one, and
// when there are already max the oldest one makes room.
const SidePicker = ({
  label,
  sideLabel,
  value = [],
  onChange,
  max = 6,
  orientation = 0,
  className,
}) => {
  const press = (side) => {
    if (value.includes(side)) {
      if (max > 1) onChange(value.filter((s) => s !== side));
      return;
    }
    onChange(max === 1 ? [side] : [...value.slice(-(max - 1)), side]);
  };

  return (
    <svg
      viewBox="-100 -100 200 200"
      role="group"
      aria-label={label}
      className={cn("size-32 shrink-0", className)}
      data-testid="side-picker"
    >
      <polygon
        points={outline(orientation)}
        className="fill-muted stroke-border"
        strokeWidth={3}
        strokeLinejoin="round"
      />
      {SIDES.map((side) => (
        <SideHandle
          key={side}
          side={side}
          orientation={orientation}
          pressed={value.includes(side)}
          label={sideLabel(side)}
          onPress={press}
        />
      ))}
    </svg>
  );
};

export default SidePicker;
