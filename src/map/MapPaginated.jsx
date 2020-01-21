import React from "react";
import { connect } from "react-redux";
import { useParams } from "react-router-dom";
import games from "../data/games";
import Map from "./Map";
import Svg from "../Svg";
import HexContext from "../context/HexContext";
import GameContext from "../context/GameContext";
import { equalPages, maxPages, printableWidth, printableHeight } from "../util";
import { Redirect } from "react-router-dom";

import PageSetup from "../PageSetup";
import VariationSelect from "../nav/VariationSelect";
import { getMapData } from "./util";
import Page from "../util/Page";

import map from "ramda/src/map";
import prop from "ramda/src/prop";

import "./MapPaginated.css";

const MapPaginated = ({ coords, pagination, paper, hexWidth }) => {
  let params = useParams();
  let game = games[params.game];
  let splitPages = pagination === "max" ? maxPages : equalPages;

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

  let pageWidth = printableWidth(paper) - 75;
  let pageHeight = printableHeight(paper) - 75;

  if (data && data.map && data.map.print === "landscape") {
    let tmp = pageWidth;
    pageWidth = pageHeight;
    pageHeight = tmp;
  }

  let xPages = splitPages(data.totalWidth + 50, pageWidth);
  let yPages = splitPages(data.totalHeight + 50, pageHeight);
  let totalPages = xPages.length * yPages.length;
  let currentPage = 0;

  let y = -25; // Start with room for margins
  let mapPages = map(height => {
    let x = -25; // Start with room for margins
    let pages = map(width => {
      currentPage++;
      let page = (
        <div
          key={`page-${x}-${y}`}
          className="cutlines"
          style={{
            width: `${(width + 25) / 100}in`,
            height: `${(height + 25) / 100}in`,
            float: "none",
            margin: "auto auto",
            boxSizing: "content-box"
          }}
        >
          <div className="MapPage">
            <Page title={game.info.title} component="Map" current={currentPage} total={totalPages} />
            <svg
              style={{
                width: `${(width + 25) / 100}in`,
                height: `${(height + 25) / 100}in`
              }}
              viewBox={`${x - 12.5} ${y - 12.5} ${width + 25} ${height + 25}`}
            >
              <use href={`#${game.info.abbrev || game.info.title}_map`} />
            </svg>
          </div>
        </div>
      );

      x = x + width;
      return page;
    }, xPages);

    y = y + height;
    return pages;
  }, yPages);

  let defs = (
    <g id={`${game.info.abbrev || game.info.title}_map`}>
      <Map name={params.game} game={game} variation={variation} />
    </g>
  );

  let variationSelect = null;
  if(Array.isArray(game.map)) {
    let variations = map(prop("name"), game.map);
    variationSelect = (
      <VariationSelect base={`/${params.game}/map-paginated/`}
                       variations={variations} />
    );
  }

  return (
    <GameContext.Provider value={params.game}>
    <HexContext.Provider
      value={{
        width: game.info.width,
        rotation: game.info.orientation === "horizontal" ? 0 : 90
      }}
    >
      <div className="PrintNotes">
        <div>
          {variationSelect}
          <p>
            This map is meant to be printed in <b>{(data && data.map && data.map.print) || "portrait"}</b>{" "}
            mode
          </p>
        </div>
      </div>
      <Svg className="FullMap" defs={defs} />
      {mapPages}
      <PageSetup landscape={data && data.map && data.map.print === "landscape"}/>
    </HexContext.Provider>
    </GameContext.Provider>
  );
};

const mapStateToProps = (state, {hexWidth}) => ({
  coords: state.config.coords,
  pagination: state.config.pagination,
  paper: state.config.paper,
  hexWidth: hexWidth || state.config.tiles.width
});

export default connect(mapStateToProps)(MapPaginated);
