import React, { useContext } from "react";
import ConfigContext from "./context/ConfigContext";

import Token from "./tokens/Token";

import addIndex from "ramda/src/addIndex";
import map from "ramda/src/map";

import { unitsToCss } from "./util";

export const getRoundTrackerData = (rounds, size, type, rotation, config) => {
  let cell = config.stock.cell;

  let getI = i => (type === "row-reverse" || type === "col-reverse") ? rounds.length - (i + 1) : i;

  let getX = (i, j = 0) => 0;
  let getY = (i, j = 0) => 0;
  let startX = 0;
  let startY = 0;

  switch (type) {
  case "row":
  case "row-reverse":
    getX = (i, j = 0) => (getI(i) + 0.5) * cell.width;
    getY = (i, j = 0) => (j + 0.5) * cell.height;
    break;
  case "col":
  case "col-reverse":
    getX = (i, j = 0) => (j + 0.5) * cell.width;
    getY = (i, j = 0) => (getI(i) + 0.5) * cell.height;
    break;
  case "round":
    startX = -2.5 * size;
    startY = -2.5 * size;
    let angle = 360 / rounds.length;
    let radians = angle * Math.PI / 180;
    let radianRotation = (rotation || 0) * Math.PI / 180;
    getX = i => Math.sin((i * radians) + radianRotation) * (size * 1.5);
    getY = i => Math.cos((i * radians) + radianRotation) * (size * -1.5);
    break;
  default:
    break;
  }

  let getArrowX1 = i => getX(i - 1) + ((getX(i) - getX(i - 1)) * 0.4);
  let getArrowX2 = i => getX(i - 1) + ((getX(i) - getX(i - 1)) * 0.6);
  let getArrowY1 = i => getY(i - 1) + ((getY(i) - getY(i - 1)) * 0.4);
  let getArrowY2 = i => getY(i - 1) + ((getY(i) - getY(i - 1)) * 0.6);

  let height = 1.5 * size;
  let width = 1.5 * size;

  switch (type) {
  case "row":
  case "row-reverse":
    width = rounds.length * size * 1.5;
    break;
  case "col":
  case "col-reverse":
    width = rounds.length * size * 1.5;
    break;
  case "round":
    width = 5 * size;
    height = 5 * size;
    break;
  default:
    break;
  }

  // Handle start and end
  let start = type === "round" ? 0 : 1;

  return {
    rounds,
    size,
    type,
    width,
    height,
    getX,
    getY,
    startX,
    startY,
    arrow: {
      start,
      getX1: getArrowX1,
      getX2: getArrowX2,
      getY1: getArrowY1,
      getY2: getArrowY2
    },
    css: {
      width: unitsToCss(width),
      height: unitsToCss(height)
    }
  };
};
const RoundTracker = ({ rounds, size, type, rotation }) => {
  const { config } = useContext(ConfigContext);

  let data = getRoundTrackerData(rounds, size, type, rotation, config);

  let roundNodes = addIndex(map)((round, index) => {
    let arrow = null;
    if (index >= data.arrow.start) {
      arrow = <line x1={data.arrow.getX1(index)}
                                       y1={data.arrow.getY1(index)}
                                       x2={data.arrow.getX2(index)}
                                       y2={data.arrow.getY2(index)}
                                       stroke="black"
                                       markerEnd="url(#arrow)" />;
    }
    return (
      <g key={`round-tracker-${index}`}>
        {arrow}
        <g transform={`translate(${data.getX(index)} ${data.getY(index)})`}>
          <Token {...round} label={round.name} width={size / (round.small ? 3 : 2)} color={round.color} />
        </g>
      </g>
    );
  }, rounds);

  return roundNodes;
};

export default RoundTracker;
