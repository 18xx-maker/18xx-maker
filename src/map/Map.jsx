import React from "react";
import { connect } from "react-redux";
import * as R from "ramda";
import Hex from "../Hex";
import Coordinates from "./Coordinates";

import { getMapData, toAlpha, toCoords } from "./util";

const Map = ({ game, coords, variation, hexWidth }) => {
  let data = getMapData(game, coords, variation, hexWidth);

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
          key={`hex-${hex.variation}-${coord}`}
        >
          <Hex hex={hex} border={true} transparent={game.info.transparent}
               map={true} id={coords === "inside" && coord} />
        </g>
      );
    }, R.map(toCoords, hex.hexes || []));
  }, data.hexes);

  return (
    <React.Fragment>
      <Coordinates {...data}/>
      {mapHexes}
    </React.Fragment>
  );
};

const mapStateToProps = state => ({
  coords: state.config.coords
});

export default connect(mapStateToProps)(Map);
