import React from "react";
import games from "./data/games";
import Map from "./Map";
import Svg from "./Svg";
import Title from "./Title";
import HexContext from "./context/HexContext";
import util from "./util";
import * as data from "./data";
import * as R from "ramda";
import { NavLink, Redirect } from "react-router-dom";

import "./MapPaginated.css";

const MapPaginated = ({ match }) => {
  let game = games[match.params.game];

  if (match.params.variation && !Array.isArray(game.map)) {
    return <Redirect to={`/${match.params.game}/map-paginated`} />;
  } else if (!match.params.variation && Array.isArray(game.map)) {
    return <Redirect to={`/${match.params.game}/map-paginated/0`} />;
  }

  let variation = Number(match.params.variation) || 0;

  let hexWidth = game.info.width;
  let edge = hexWidth * util.HEX_RATIO;
  let halfHexWidth = 0.5 * hexWidth;

  let map = Array.isArray(game.map) ? game.map[variation] : game.map;
  let maxX = util.maxMapX(map.hexes);
  let maxY = util.maxMapY(map.hexes);

  let totalWidth = (game.info.extraTotalWidth || 0) + halfHexWidth * (maxX + 1);
  let totalHeight =
    (game.info.extraTotalHeight || 0) + (1.5 * (maxY - 1) * edge + 2 * edge);

  if (game.info.orientation === "horizontal") {
    let tmp = totalWidth;
    totalWidth = totalHeight;
    totalHeight = tmp;
  }

  let pageWidth = data.paper.width - 75;
  let pageHeight = data.paper.height - 75;

  if (game.map.print === "landscape") {
    let tmp = pageWidth;
    pageWidth = pageHeight;
    pageHeight = tmp;
  }

  console.log({ totalWidth, totalHeight, pageWidth, pageHeight });

  let y = -25; // Start with room for margins
  let mapPages = R.map(height => {
    let x = -25; // Start with room for margins
    let pages = R.map(width => {
      let page = (
        <div className="cutlines">
          <div className="MapPage">
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
    }, util.pages(totalWidth + 50, pageWidth));

    y = y + height;
    return pages;
  }, util.pages(totalHeight + 50, pageHeight));

  let defs = (
    <g id={`${game.info.abbrev || game.info.title}_map`}>
      <Title game={game} variation={variation} />
      <Map game={game} variation={variation} />
    </g>
  );

  return (
    <HexContext.Provider
      value={{
        width: game.info.width,
        rotation: game.info.orientation === "horizontal" ? 0 : 90
      }}
    >
      <Svg className="FullMap" defs={defs} />
      <div className="PrintNotes">
        This map is meant to be printed in <b>{game.map.print || "portrait"}</b>{" "}
        mode
        {Array.isArray(game.map) && (
          <ul>
            {game.map.map((m, i) => (
              <li key={`${match.params.game}-${i}`}>
                <NavLink to={`/${match.params.game}/map-paginated/${i}`}>
                  {m.name}
                </NavLink>
              </li>
            ))}
          </ul>
        )}
      </div>
      {mapPages}
    </HexContext.Provider>
  );
};

export default MapPaginated;
