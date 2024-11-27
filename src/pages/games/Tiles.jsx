import { useNavigate } from "react-router";

import { useConfig, useGame } from "@/hooks";

import "@/pages/games/Tiles.css";

import {
  addIndex,
  append,
  clone,
  compose,
  concat,
  defaultTo,
  drop,
  filter,
  groupBy,
  includes,
  is,
  keys,
  map,
  pipe,
  prop,
  reduce,
  repeat,
  take,
  uniq,
  unnest,
} from "ramda";

import Svg from "@/Svg";
import Hex from "@/components/Hex";
import PageSetup from "@/components/PageSetup";
import Pins from "@/components/Pins";
import ColorContext from "@/context/ColorContext";
import { tiles as tileDefs } from "@/data";
import Cutlines from "@/tilesheet/Cutlines";
import { getTileSheetContext } from "@/tilesheet/util";
import { getTile, sortTiles } from "@/util";
import Page from "@/util/Page";
import { sidesFromTile } from "@/util/track";

const gatherIds = (tiles) => {
  return compose(
    unnest,
    map((id) =>
      Array(
        is(Object, tiles[id])
          ? // like a three-part propOR of "print" || "quantity" || 1
            pipe(
              prop("print"),
              defaultTo(pipe(prop("quantity"), defaultTo(1))(tiles[id])),
            )(tiles[id])
          : tiles[id],
      ).fill(id),
    ),
  )(keys(tiles));
};

const gatherTiles = (tiles) =>
  compose(sortTiles, map(getTile(tileDefs, tiles)), gatherIds)(tiles);

const rotate = (sides) => map((s) => (s % 6) + 1, sides);

const tileAboveSmall = (page, i) => {
  let offset = i % 60;
  if ([0, 9, 17, 26, 34, 43, 51].includes(offset)) {
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
  if ([0, 9, 17, 26, 34, 43, 51].includes(offset)) {
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

  while (rest.length > 0 && rest[0] === null) {
    rest = drop(1, rest);
  }

  return pageTiles(perPage, append(current, pages), rest);
};

const TileSheet = () => {
  const navigate = useNavigate();
  const { config } = useConfig();
  const game = useGame();
  const paper = config.paper;
  const { layout, width: hexWidth, gaps } = config.tiles;

  if (!game.tiles) {
    navigate(`/games/${game.meta.slug}/`);
  }

  let c = getTileSheetContext(layout, paper, hexWidth);

  let tiles = gatherTiles(game.tiles);

  // Let's group by color/gauge OR a group field you can provide
  let groupedByColor = addIndex(groupBy)((tile, i) => {
    if (tile.group === "individual") {
      return `z-${i}`;
    }

    if (tile.group) {
      return tile.group;
    }

    // Group by guages, but individual if a tile has multiple
    let gauges = uniq(map((track) => track.gauge || "normal", tile.track));
    if (gauges.length > 1) {
      return `z-${i}`;
    }

    // Group grey and gray together
    let color = tile.color;
    if (color === "grey") {
      color = "gray";
    }

    return `${color}-${gauges[0]}`;
  }, tiles);

  let separatedTiles = compose(
    reduce((tiles, color) => {
      if (tiles.length === 0) return color;

      // If people don't want gaps... let them do it!
      if (gaps === false) {
        return concat(tiles, color);
      }

      switch (layout) {
        case "offset":
          if (
            Math.ceil(((tiles.length + 1) % c.perPage) / c.perRow) % 2 !==
            0
          ) {
            return concat(tiles, concat(repeat(null, c.perRow), color));
          } else {
            return concat(tiles, concat(repeat(null, c.perRow + 1), color));
          }
        case "smallDie":
          if ([0, 9, 17, 26, 34, 43, 51].includes(tiles.length % 60)) {
            return concat(tiles, color);
          } else {
            return concat(tiles, concat([null], color));
          }
        case "die":
          // If we are using transparent tiles, add enough for a new page
          if (color[0].color === "none") {
            return concat(
              tiles,
              concat(
                repeat(null, c.perPage - (tiles.length % c.perPage)),
                color,
              ),
            );
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
    filter((x) => x && x.length > 0),
    map((color) => groupedByColor[color]),
  )(keys(groupedByColor));

  let pagedTiles = pageTiles(c.perPage, [], separatedTiles);

  let pageNodes = addIndex(map)((page, pageIndex) => {
    let sides = [];
    let tileNodes = addIndex(map)((hex, i) => {
      if (hex === null) {
        sides.push([]);
        return null;
      }

      let rotation = 0;
      let clipPath = c.clipPath;

      if (
        layout === "smallDie" ||
        layout === "die" ||
        layout === "individual"
      ) {
        let currentSides = sidesFromTile(hex);
        let pastSides = [];
        if ((layout === "smallDie" || layout === "die") && i - 1 >= 0) {
          pastSides = sides[i - 1];
        } else if (layout === "individual" && i - c.perRow >= 0) {
          pastSides = sides[i - c.perRow];
        }

        if (layout === "smallDie") {
          if (tileAboveSmall(page, i) && tileBelowSmall(page, i)) {
            clipPath = "hexBleedClipPathDie";
          } else if (tileAboveSmall(page, i)) {
            clipPath = "hexBleedClipPathDieBottom";
          } else if (tileBelowSmall(page, i)) {
            clipPath = "hexBleedClipPathDieTop";
          } else {
            clipPath = "hexBleedClipPath";
          }
        }

        if (layout === "die") {
          if (tileAbove(page, i) && tileBelow(page, i)) {
            clipPath = "hexBleedClipPathDie";
          } else if (tileAbove(page, i)) {
            clipPath = "hexBleedClipPathDieBottom";
          } else if (tileBelow(page, i)) {
            clipPath = "hexBleedClipPathDieTop";
          } else {
            clipPath = "hexBleedClipPath";
          }
        }

        // No need to line up track for "offset" or "individual"
        if (
          (layout === "die" || layout === "smallDie") &&
          pastSides.length > 0
        ) {
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
      if (hex.clipPath === false) {
        clipPath = "hexClipPath";
      }

      if (hex.rotation) {
        rotation = hex.rotation;
      }

      return (
        <g
          clipPath={`url(#${clipPath})`}
          transform={`translate(${c.getX(i)} ${c.getY(i)}) scale(${c.hexWidth / 150})`}
          key={`${hex.id}-${i}`}
        >
          <g transform={`rotate(${rotation})`}>
            <Hex hex={hex} id={hex.id} clipPath="hexBleedClipPath" />
          </g>
        </g>
      );
    }, page);

    let widthIn, viewBoxStr;
    if (layout === "smallDie") {
      widthIn = (c.pageWidth + 20) * 0.01;
      viewBoxStr = "-10 0 " + (c.pageWidth + 20) + " " + c.pageHeight;
    } else {
      widthIn = c.pageWidth * 0.01;
      viewBoxStr = "0 0 " + c.pageWidth + " " + c.pageHeight;
    }

    let pins =
      layout === "die" || layout === "smallDie" ? (
        <Pins config={config.tiles.pins} />
      ) : null;

    return (
      <div className="TileSheet--Page" key={`page-${pageIndex}`}>
        <Page
          title={game.info.title}
          component="Tiles"
          current={pageIndex + 1}
          total={pagedTiles.length}
        />
        <Svg
          style={{
            width: `${widthIn}in`,
            height: `${c.pageHeight * 0.01}in`,
          }}
          viewBox={`${viewBoxStr}`}
        >
          <Cutlines />
          {pins}
          {tileNodes}
        </Svg>
      </div>
    );
  }, pagedTiles);

  return (
    <ColorContext.Provider value="tile">
      <div
        data-testid={`game-${game.meta.slug}-tiles`}
        className={`tileSheet tileSheet--${layout}`}
      >
        {pageNodes}
        <PageSetup paper={c.paper} landscape={false} />
      </div>
    </ColorContext.Provider>
  );
};

export default TileSheet;
