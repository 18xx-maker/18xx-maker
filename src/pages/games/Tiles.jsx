import React, { useContext } from "react";
import { Redirect } from "react-router-dom";

import ConfigContext from "../../context/ConfigContext";
import GameContext from "../../context/GameContext";

import "../../TileSheet.scss";

import { getTile, sortTiles } from "../../util";
import { getTileSheetContext } from "../../tilesheet/util";

import { tiles as tileDefs } from "@18xx-maker/games";

import { sidesFromTile } from "../../atoms/Track";
import Svg from "../../Svg";
import Page from "../../util/Page";
import PageSetup from "../../PageSetup";
import Hex from "../../Hex";

import ColorContext from "../../context/ColorContext";

import Cutlines from "../../tilesheet/Cutlines";
import Pins from "../../tilesheet/Pins";

import addIndex from "ramda/src/addIndex";
import append from "ramda/src/append";
import clone from "ramda/src/clone";
import compose from "ramda/src/compose";
import concat from "ramda/src/concat";
import drop from "ramda/src/drop";
import filter from "ramda/src/filter";
import groupBy from "ramda/src/groupBy";
import includes from "ramda/src/includes";
import is from "ramda/src/is";
import keys from "ramda/src/keys";
import map from "ramda/src/map";
import pipe from "ramda/src/pipe";
import prop from "ramda/src/prop";
import defaultTo from "ramda/src/defaultTo";
import reduce from "ramda/src/reduce";
import repeat from "ramda/src/repeat";
import take from "ramda/src/take";
import unnest from "ramda/src/unnest";

const gatherIds = tiles => {
  return compose(unnest,
            map(id => Array((is(Object, tiles[id]) ?
              // like a three-part propOR of "print" || "quantity" || 1
              pipe(prop("print"), defaultTo(pipe(prop("quantity"),
                defaultTo(1))(tiles[id])))(tiles[id]) :
                            tiles[id])).fill(id)))(keys(tiles));
}

const gatherTiles = tiles => compose(sortTiles,
                                    map(getTile(tileDefs, tiles)),
                                    gatherIds)(tiles);

const rotate = sides => map(s => (s % 6) + 1, sides);

const tileAboveSmall = (page, i) => {
  let offset = i % 60;
  if ([0,9,17,26,34,43,51].includes(offset)) {
    return null;
  }

  let target = i - 1;
  return target >= 0 && page[target];
};
const tileAbove = (page, i) => {
  if (i % 6 === 0) {
    return null;
  }

  let target = i - 1;
  return target >= 0 && page[target];
};

const tileBelowSmall = (page, i) => {
  let offset = (i + 1) % 60;
  if ([0,9,17,26,34,43,51].includes(offset)) {
    return null;
  }

  let target = i + 1;
  return target < page.length && page[target];
};
const tileBelow = (page, i) => {
  if ((i + 1) % 6 === 0) {
    return null;
  }

  let target = i + 1;
  return target < page.length && page[target];
};

const pageTiles = (perPage, pages, tiles) => {
  if (tiles.length === 0) return pages;

  let current = take(perPage, tiles);
  let rest = drop(perPage, tiles);

  while(rest.length > 0 && rest[0] === null) {
    rest = drop(1, rest);
  }

  return pageTiles(perPage, append(current, pages), rest);
};

const TileSheet = () => {
  const { config } = useContext(ConfigContext);
  const { game } = useContext(GameContext);
  const paper = config.paper;
  const { layout, width: hexWidth, gaps } = config.tiles;

  if (!game.tiles) {
    return <Redirect to={`/games/${game.slug}/`} />;
  }

  let c = getTileSheetContext(layout, paper, hexWidth);

  let tiles = gatherTiles(game.tiles);

  // Let's group by color OR a group field you can provide
  let groupedByColor = addIndex(groupBy)((tile, i) => {
    if (tile.group === "individual") {
      return `z-${i}`;
    }

    return tile.group || tile.color;
  }, tiles);

  let separatedTiles = compose(
    reduce((tiles, color) => {
      if (tiles.length === 0) return color;

      // If people don't want gaps... let them do it!
      if (gaps === false) {
        return concat(tiles, color);
      }

      switch(layout) {
      case "offset":
        let odd = Math.ceil(((tiles.length + 1) % c.perPage) / c.perRow) % 2 !== 0;

        if (odd) {
          return concat(tiles, concat(repeat(null, c.perRow), color));
        } else {
          return concat(tiles, concat(repeat(null, c.perRow + 1), color));
        }
      case "smallDie":
        let offset = tiles.length % 60;
        if ([0,9,17,26,34,43,51].includes(offset)) {
          return concat(tiles, color);
        } else {
          return concat(tiles, concat([null], color));
        }
      case "die":
        // If we are using transparent tiles, add enough for a new page
        if (color[0].color === "none") {
          return concat(tiles, concat(repeat(null, c.perPage - (tiles.length % c.perPage)), color));
        }

        if (tiles.length % 6 === 0) {
          return concat(tiles, color);
        } else {
          return concat(tiles, concat([null], color));
        }
      default:
        return concat(tiles, color);
      }
    }, []),
    filter(x => x && x.length > 0),
    map(color => groupedByColor[color])
  )(keys(groupedByColor));

  let pagedTiles = pageTiles(c.perPage, [], separatedTiles);

  let pageNodes = addIndex(map)((page, pageIndex) => {
    let sides = [];
    let tileNodes = addIndex(map)(
      (hex, i) => {
        if (hex === null) {
          sides.push([]);
          return null;
        }

        let rotation = 0;
        let mask = c.mask;

        if (layout === "smallDie" || layout === "die" || layout === "individual") {
          let currentSides = sidesFromTile(hex);
          let pastSides = [];
          if ((layout === "smallDie" || layout === "die") && i - 1 >= 0) {
            pastSides = sides[i - 1];
          } else if (layout === "individual" && i - c.perRow >= 0) {
            pastSides = sides[i - c.perRow];
          }

          if (layout === "smallDie") {
            if (tileAboveSmall(page, i) && tileBelowSmall(page, i)) {
              mask = "hexBleedMaskDie";
            } else if (tileAboveSmall(page, i)) {
              mask = "hexBleedMaskDieBottom";
            } else if (tileBelowSmall(page, i)) {
              mask = "hexBleedMaskDieTop";
            } else {
              mask = "hexBleedMask";
            }
          }

          if (layout === "die") {
            if (tileAbove(page, i) && tileBelow(page, i)) {
              mask = "hexBleedMaskDie";
            } else if (tileAbove(page, i)) {
              mask = "hexBleedMaskDieBottom";
            } else if (tileBelow(page, i)) {
              mask = "hexBleedMaskDieTop";
            } else {
              mask = "hexBleedMask";
            }
          }

          // No need to line up track for "offset" or "individual"
          if ((layout === "die" || layout === "smallDie") &&
              pastSides.length > 0) {
            if (includes(1, pastSides)) {
              // Track above us has track on the bottom, if we have track on the
              // top do nothing

              if (includes(1, currentSides) && includes(4, currentSides)) {
                // Nothing
              } else if (includes(2, currentSides) && includes(5, currentSides)) {
                rotation = 120;
                currentSides = rotate(rotate(currentSides));
              } else if (includes(3, currentSides) && includes(6, currentSides)) {
                rotation = 60;
                currentSides = rotate(currentSides);
              } else {
                while (!includes(4, currentSides)) {
                  rotation += 60;
                  currentSides = rotate(currentSides);
                  if (rotation >= 360) {
                    break;
                  }
                }
              }
            } else {
              while (includes(4, currentSides)) {
                rotation += 60;
                currentSides = rotate(currentSides);
                if (rotation >= 360) {
                  break;
                }
              }
            }
          }

          sides.push(clone(currentSides));
        }

        // Overrides from tile definitions
        if (hex.mask === false) {
          mask = "hexMask";
        }

        if (hex.rotation) {
          rotation = hex.rotation;
        };

        return (
          <g mask={`url(#${mask})`}
             transform={`translate(${c.getX(i)} ${c.getY(i)}) scale(${c.hexWidth/150})`}
             key={`${hex.id}-${i}`}>
            <g transform={`rotate(${rotation})`}>
              <Hex hex={hex} id={hex.id} mask="hexBleedMask" />
            </g>
          </g>
        )
      },
      page
    );

    let pins = (layout === "die" || layout === "smallDie") ? <Pins/> : null;

    return (
      <div className="TileSheet--Page"
           key={`page-${pageIndex}`}>
        <Page title={game.info.title} component="Tiles" current={pageIndex + 1} total={pagedTiles.length} />
        <Svg
          style={{
            width: `${c.pageWidth * 0.01}in`,
            height: `${c.pageHeight * 0.01}in`,
          }}
          viewBox={`0 0 ${c.pageWidth} ${c.pageHeight}`}
        >
          <Cutlines/>
          {pins}
          {tileNodes}
        </Svg>
      </div>
    );
  }, pagedTiles);

  return (
    <ColorContext.Provider value="tile">
      <div className={`tileSheet tileSheet--${layout}`}>
        {pageNodes}
        <PageSetup paper={c.paper}
                   landscape={false}/>
      </div>
    </ColorContext.Provider>
  );
};

export default TileSheet;
