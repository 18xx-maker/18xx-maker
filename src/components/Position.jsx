import { useContext } from "react";

import {
  addIndex,
  any,
  chain,
  has,
  identity,
  includes,
  map,
  omit,
} from "ramda";

import HexContext from "@/context/HexContext";
import { useOrientation } from "@/context/OrientationContext";
import { namedPosition } from "@/util/tiles/trackGeometry";

const autoPositionTypes = ["icon", "label", "terrain", "value"];
const positionNames = [
  "align",
  "angle",
  "mid",
  "percent",
  "rotate",
  "rotation",
  "side",
  "x",
  "y",
];

export const hasPositioning = (element) => {
  return any(
    identity,
    map((name) => {
      return has(name, element);
    }, positionNames),
  );
};

const countElement = (hex, element) => {
  return hex[element] ? hex[element].length : 0;
};

const hasElement = (hex, element) => {
  return countElement(hex, element) > 0;
};

const hasCenterElement = (hex) => {
  return hasElement(hex, "cities") || hasElement(hex, "centerTowns");
};

const autoPositionIcon = (d, i, hex) => {
  if (!hasCenterElement(hex)) {
    return d;
  }

  if (hasElement(hex, "terrain")) {
    return {
      ...d,
      angle: 30,
      percent: 0.6,
    };
  }

  return {
    ...d,
    angle: 0,
    percent: 0.6,
  };
};

const autoPositionValue = (d, i) => {
  if (i >= 1) {
    return d;
  }

  return {
    ...d,
    angle: 210,
    percent: 0.7,
  };
};

const autoPositionLabel = (d, i) => {
  switch (i) {
    case 0:
      return {
        ...d,
        angle: 150,
        percent: 0.7,
      };
    case 1:
      return {
        ...d,
        angle: 270,
        percent: 0.7,
      };
    default:
      return d;
  }
};

const autoPositionTerrain = (d, i, hex) => {
  if (!hasCenterElement(hex)) {
    return d;
  }

  if (hasElement(hex, "icons")) {
    return {
      ...d,
      angle: 330,
      percent: 0.7,
    };
  }

  return {
    ...d,
    angle: 0,
    percent: 0.7,
  };
};

export const autoPosition = (d, i, hex, type) => {
  switch (type) {
    case "icon":
      return autoPositionIcon(d, i, hex);
    case "label":
      return autoPositionLabel(d, i, hex);
    case "terrain":
      return autoPositionTerrain(d, i, hex);
    case "value":
      return autoPositionValue(d, i, hex);
    default:
      return d;
  }
};

const Position = ({ data, type, pick, children }) => {
  const hex = useContext(HexContext);
  const orientation = useOrientation();

  if (!data) {
    data = [];
  } else if (!Array.isArray(data)) {
    data = [data];
  }

  return addIndex(chain)((d, i) => {
    // Only render the picked elements (index and position stay as if all were)
    if (pick && !pick(d)) {
      return [];
    }

    // If this element is hidden, then don't need to render anything
    if (d.hidden) {
      return [];
    }

    // are we auto positioning?
    if (includes(type, autoPositionTypes) && !hasPositioning(d)) {
      d = autoPosition(d, i, hex, type);
    }

    // Set everything to defaults of 0
    let angle = d.angle || 0;
    let rotation = d.rotate || d.rotation || 0;
    let percent = d.percent || 0;
    const named = d.mid ? namedPosition(d.mid, d.side, d.align) : null;
    if (named) {
      // A named point on track: explicit angle and percent still win
      // Track is drawn turned by the orientation inside the map hex, so a
      // point on it is turned the same
      angle = has("angle", d) ? angle : named.angle + orientation;
      percent = has("percent", d) ? percent : named.percent;
      rotation =
        rotation +
        (named.rotation === undefined ? 0 : named.rotation + orientation);
    } else if (d.side) {
      rotation = rotation + (d.side - 1) * 60;
    }

    let x = d.x || 0;
    let y = d.y || 0;

    // Compute percent distant into translate
    let translate = 75 * percent;
    let rotate = -angle + (rotation || 0);

    // The children only see the rotation; with a mid it is the effective one
    let passing = named
      ? { ...omit(["order", "mid", "align", "rotate"], d), rotation }
      : omit(["order", "mid", "align"], d);

    return [
      <g
        key={`position-${i}`}
        transform={`rotate(${angle} ${x} ${y}) translate(0 ${translate}) rotate(${rotate} ${x} ${y}) translate(${x} ${y})`}
      >
        {children(passing)}
      </g>,
    ];
  }, data);
};

export default Position;
