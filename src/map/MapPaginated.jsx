import React from "react";
import { connect } from "react-redux";
import { useParams } from "react-router-dom";
import games from "../data/games";
import Map from "./Map";
import HexContext from "../context/HexContext";
import GameContext from "../context/GameContext";
import { Redirect } from "react-router-dom";
import { isElectron } from "../util";

import VariationSelect from "../nav/VariationSelect";
import { getMapData } from "./util";

import map from "ramda/src/map";
import prop from "ramda/src/prop";

import Paginate from "../util/Paginate";
import "./MapPaginated.css";

let ipcRenderer = undefined;
if (isElectron) {
  ipcRenderer = window.require('electron').ipcRenderer;
}

const MapPaginated = ({ coords, paper, hexWidth }) => {
  let params = useParams();
  let game = games[params.game];

  if (!game.map) {
    return <Redirect to={`/${params.game}/background`} />;
  } else if (game.info.paginated === false && params.variation) {
    return <Redirect to={`/${params.game}/map/${params.variation}`} />;
  } else if (game.info.paginated === false) {
    return <Redirect to={`/${params.game}/map`} />;
  } else if (params.variation && !Array.isArray(game.map)) {
    return <Redirect to={`/${params.game}/map-paginated`} />;
  } else if (!params.variation && Array.isArray(game.map)) {
    return <Redirect to={`/${params.game}/map-paginated/0`} />;
  }

  let variation = Number(params.variation) || 0;
  let data = getMapData(game, coords, hexWidth, variation);

  let variationSelect = null;
  if(Array.isArray(game.map)) {
    let variations = map(prop("name"), game.map);
    variationSelect = (
      <VariationSelect base={`/${params.game}/map-paginated/`}
                       variations={variations} />
    );
  }

  let handler = () => {
    if (isElectron) {
      ipcRenderer.send('pdf', `/${params.game}/map-paginated`);
    }
  }

  return (
    <GameContext.Provider value={params.game}>
    <HexContext.Provider
      value={{
        width: game.info.width,
        rotation: game.info.orientation === "horizontal" ? 0 : 90
      }}
    >
      <Paginate component="Map"
                notes={<>
                         {variationSelect}
                         {isElectron && <button onClick={handler}>Print</button>}
                       </>}
                data={data}>
        <Map name={params.game} game={game} variation={variation} />
      </Paginate>
    </HexContext.Provider>
    </GameContext.Provider>
  );
};

const mapStateToProps = (state, {hexWidth}) => ({
  coords: state.config.coords,
  paper: state.config.paper,
  hexWidth: hexWidth || state.config.tiles.mapWidth
});

export default connect(mapStateToProps)(MapPaginated);
