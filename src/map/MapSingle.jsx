import React from "react";
import { connect } from "react-redux";
import games from "../data/games";
import Map from "./Map";
import Svg from "../Svg";
import HexContext from "../context/HexContext";
import * as R from "ramda";
import { Redirect, useParams } from "react-router-dom";
import { isElectron } from "../util";

import VariationSelect from "../nav/VariationSelect";
import { getMapData } from "./util";

let ipcRenderer = undefined;
if (isElectron) {
  ipcRenderer = window.require('electron').ipcRenderer;
}

const MapSingle = ({ coords, hexWidth }) => {
  let params = useParams();
  let game = games[params.game];

  // Do redirects if we need or do not need a variation in the url
  if (!game.map) {
    return <Redirect to={`/${params.game}/background`} />;
  } else if (params.variation && !Array.isArray(game.map)) {
    return <Redirect to={`/${params.game}/map`} />;
  } else if (!params.variation && Array.isArray(game.map)) {
    return <Redirect to={`/${params.game}/map/0`} />;
  }

  // Get map data
  let variation = Number(params.variation) || 0;
  let data = getMapData(game, coords, hexWidth, variation);

  // Variation Select Box
  let variationSelect = null;
  if(Array.isArray(game.map)) {
    let variations = R.map(R.prop("name"), game.map);
    variationSelect = (
      <VariationSelect base={`/${params.game}/map/`}
                       variations={variations} />
    );
  }

  let handler = () => {
    if (isElectron) {
      ipcRenderer.send('pdf', `/${params.game}/map`);
    }
  }

  return (
    <HexContext.Provider
      value={{
        width: data.hexWidth,
        rotation: data.horizontal ? 0 : 90
      }}
    >
      <div className="PrintNotes">
        <div>
          {variationSelect}
          <h3>Width: {data.humanWidth}</h3>
          <h3>Height: {data.humanHeight}</h3>
          {isElectron && <button onClick={handler}>Print</button>}
        </div>
      </div>
      <div className="map">
        <Svg width={data.totalWidth} height={data.totalHeight}>
          <Map name={params.game} game={game} variation={variation} />
        </Svg>
        <style>{`@media print {@page {size: ${data.printWidth} ${data.printHeight}; margin: 0.25in 0.25in 0.25in 0.25in; }}`}</style>
      </div>
    </HexContext.Provider>
  );
};

const mapStateToProps = state => ({
  coords: state.config.coords,
  hexWidth: state.config.tiles.mapWidth
});

export default connect(mapStateToProps)(MapSingle);
