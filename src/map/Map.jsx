import React from "react";
import { connect } from "react-redux";
import * as R from "ramda";

import Hex from "../Hex";

import Coordinates from "./Coordinates";
import Borders from "./Borders";
import Lines from "./Lines";
import Title from "./Title";

import MapRoundTracker from "./MapRoundTracker";

import { getMapData, toAlpha, toCoords } from "./util";

const Map = ({ name, game, coords, variation, hexWidth }) => {
  let data = getMapData(game, coords, hexWidth, variation);

  if (!data.map) {
    return null;
  }

  let mapHexes = R.chain(hex => {
    return R.map(([x, y]) => {
      let translate = `translate(${data.hexX(x, y)} ${data.hexY(x, y)})`;
      let scale = `scale(${data.scale})`;
      let coord = `${toAlpha(y)}${x}`;
      return (
        <g
          transform={`${translate} ${scale}`}
          key={`hex-${name}-${hex.variation}-${coord}`}
        >
          <Hex hex={hex} border={true} transparent={game.info.transparent}
               map={true} id={coords === "inside" && coord} />
        </g>
      );
    }, R.map(toCoords, hex.hexes || []));
  }, data.hexes);

  return (
    <React.Fragment>
      {mapHexes}
      <Coordinates {...data}/>
      <Title game={game} variation={variation} hexWidth={hexWidth} />
      <MapRoundTracker game={game} hexWidth={hexWidth} />
      <Borders data={data} />
      <Lines data={data} />
    </React.Fragment>
  );
};

const mapStateToProps = (state, {hexWidth}) => ({
  coords: state.config.coords,
  hexWidth: hexWidth || state.config.tiles.mapWidth
});

export default connect(mapStateToProps)(Map);
