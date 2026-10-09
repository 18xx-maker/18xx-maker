import { defaultTo } from "ramda";

import Color from "@/components/Color";

import { useAssets } from "@/hooks";
import { resolveAsset } from "@/util/assets";

const Icon = ({
  type,
  color,
  width,
  noCircle,
  fillColor,
  strokeColor,
  strokeWidth,
}) => {
  const assets = useAssets();
  const Component = resolveAsset("icons", type, assets);
  let icon;
  let iconWidth = width || "25";
  let iconPos = -1 * (width / 2) || "-12.5";
  let circleR = width - 10 || "15";
  fillColor = defaultTo("white", fillColor);
  strokeColor = defaultTo("black", strokeColor);
  strokeWidth = defaultTo("2", strokeWidth);

  if (Component) {
    icon = (
      <Component
        className={`icon-color-main-${color}`}
        width={iconWidth}
        height={iconWidth}
        x={iconPos}
        y={iconPos}
      />
    );
  }

  if (noCircle) {
    return <Color>{() => <g>{icon}</g>}</Color>;
  } else {
    return (
      <Color>
        {(c, t, s, p) => (
          <g>
            <circle
              fill={p(fillColor)}
              stroke={p(strokeColor)}
              strokeWidth={strokeWidth}
              cx="0"
              cy="0"
              r={circleR}
            />
            {icon}
          </g>
        )}
      </Color>
    );
  }
};

export default Icon;
