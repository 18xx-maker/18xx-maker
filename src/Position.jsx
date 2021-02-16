import React, {useContext} from "react";
import addIndex from "ramda/src/addIndex";
import any from "ramda/src/any";
import chain from "ramda/src/chain";
import has from "ramda/src/has";
import identity from "ramda/src/identity";
import includes from "ramda/src/includes";
import map from "ramda/src/map";

import HexContext from "./context/HexContext";

const autoPositionTypes = ["icon", "label", "terrain", "value"];
const positionNames = ["angle", "percent", "rotate", "rotation", "side", "x", "y"];

const hasPositioning = element => {
  return any(identity, map(name => {
    return has(name, element);
  }, positionNames));
};

const countElement = (hex, element) => {
  return hex[element] ? hex[element].length : 0;
};

const hasElement = (hex, element) => {
  return countElement(hex, element) > 0;
};

const hasCenterElement = hex => {
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
      percent: 0.6
    };
  }

  return {
    ...d,
    angle: 0,
    percent: 0.6
  };

}

const autoPositionValue = (d, i, hex) => {
  if (i >= 1) {
    return d;
  }

  return {
    ...d,
    angle: 210,
    percent: 0.7
  };
};

const autoPositionLabel = (d, i, hex) => {
  switch (i) {
    case 0:
      return {
        ...d,
        angle: 150,
        percent: 0.7
      };
    case 1:
      return {
        ...d,
        angle: 270,
        percent: 0.7
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
      percent: 0.7
    };
  }

  return {
    ...d,
    angle: 0,
    percent: 0.7
  };
}

const autoPosition = (d, i, hex, type) => {
  switch(type) {
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
}

const Position = ({ data, type, children }) => {
  const hex = useContext(HexContext);

  if (!data) {
    data = [];
  } else if (!Array.isArray(data)) {
    data = [data];
  }

  return addIndex(chain)((d, i) => {
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
    if (d.side) {
      rotation = rotation + (d.side - 1) * 60;
    }

    let x = d.x || 0;
    let y = d.y || 0;

    // Compute percent distant into translate
    let translate = 75 * (d.percent || 0);
    let rotate = -(d.angle || 0) + (rotation || 0);

    let passing = {...d};

    return [
      <g
        key={`position-${i}`}
        transform={`rotate(${angle} ${x} ${y}) translate(0 ${translate}) rotate(${rotate} ${x} ${y}) translate(${x} ${y})`}
      >
        {children(passing)}
      </g>
    ];
  }, data);
};

export default Position;
