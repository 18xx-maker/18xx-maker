import React from "react";
import util from "./util";
import { colors } from "./data";
import tiles from "./data/tiles";
import Id from "./Id";
import Track from "./Track";

const Tile = ({ id, width, x, y }) => {
  let data = util.hexData(width, true, x, y);
  let { color, track } = tiles[id];

  let borders = (track || []).map(t => (
    <Track
      track={t}
      width={width}
      x={x}
      y={y}
      strokeWidth="14"
      color={colors["border"]}
    />
  ));
  let tracks = (track || []).map(t => (
    <Track
      track={t}
      width={width}
      x={x}
      y={y}
      strokeWidth="10"
      color={colors["track"]}
    />
  ));

  return (
    <g>
      <polygon points={util.pointsToString(data.points)} fill={colors[color]} />

      <Id id={id} width={width} x={x} y={y} />

      {borders}
      {tracks}

      <polygon
        points={util.pointsToString(data.points)}
        fill="transparent"
        stroke={colors["track"]}
        strokeLinecap="round"
        strokeLinejoin="bevel"
        strokeWidth="2"
      />
    </g>
  );
};

export default Tile;
