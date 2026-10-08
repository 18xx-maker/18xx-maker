import HtmlEditor from "@/components/editor/HtmlEditor";

import { useConfig, useGame } from "@/hooks";

import "@/components/pages/games/Tiles.css";

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

import Cutlines from "@/components/Cutlines";
import Hex from "@/components/Hex";
import Pins from "@/components/Pins";
import Page from "@/components/page/Page";
import PageSetup from "@/components/page/PageSetup";
import Svg from "@/components/svg/Svg";
import TilesOverlay, {
  TilesTap,
  useTilesEditing,
} from "@/components/tiles/TilesOverlay";

import ColorContext from "@/context/ColorContext";
import { tiles as tileDefs } from "@/data";
import { getTile, layoutPaper, sortTiles } from "@/util";
import {
  getTileSheetContext,
  offsetBleedId,
  offsetBleedPoints,
  offsetNeighbors,
  reorderForBleed,
} from "@/util/tiles/tilesheet";
import { alignSides, sidesFromTile } from "@/util/tiles/track";

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

// The id and position of every tile on a page
const cellsOf = (page) =>
  page.flatMap((hex, index) => (hex ? [{ id: hex.id, index }] : []));

const TilesPage = () => {
  const { config } = useConfig();
  const game = useGame();
  const editing = useTilesEditing();
  const paper = layoutPaper(config.paper, config.printScale);
  const { layout, width: hexWidth, gaps, cutBorder } = config.tiles;

  // A game without tiles has a page with nothing on it, where the edit panel
  // adds the first one (not the editor: it cannot fit an empty page)
  if (!game.tiles) {
    return <div data-testid={`game-${game.meta.slug}-tiles`} />;
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
    let gauges = uniq(
      map((track) => track.gauge || "normal", tile.track || []),
    );
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
    addIndex(reduce)((tiles, key, i, orderedKeys) => {
      const color = groupedByColor[key];
      if (tiles.length === 0) return color;

      // If people don't want gaps... let them do it!
      if (gaps === false) {
        return concat(tiles, color);
      }

      switch (layout) {
        case "offset":
          // Individual tiles pack together, a gap per tile wastes whole rows
          if (key.startsWith("z-") && orderedKeys[i - 1].startsWith("z-")) {
            return concat(tiles, color);
          }
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
    filter((key) => groupedByColor[key]?.length > 0),
  )(keys(groupedByColor));

  let pagedTiles = pageTiles(c.perPage, [], separatedTiles);

  if (layout === "die" || layout === "smallDie") {
    const groupOf = new Map();
    keys(groupedByColor).forEach((key) =>
      groupedByColor[key].forEach((tile) => groupOf.set(tile, key)),
    );
    pagedTiles = pagedTiles.map((page) =>
      reorderForBleed(
        page,
        (tile) => groupOf.get(tile),
        layout === "die" ? tileAbove : tileAboveSmall,
      ),
    );
  }

  let widthIn, viewBoxStr;
  if (layout === "smallDie") {
    widthIn = (c.pageWidth + 20) * 0.01;
    viewBoxStr = "-10 0 " + (c.pageWidth + 20) + " " + c.pageHeight;
  } else {
    widthIn = c.pageWidth * 0.01;
    viewBoxStr = "0 0 " + c.pageWidth + " " + c.pageHeight;
  }

  let pins =
    layout === "die" || layout === "smallDie" || config.tiles.showPins ? (
      <Pins config={config.tiles.pins} />
    ) : null;

  const svgStyle = {
    width: `${widthIn}in`,
    height: `${c.pageHeight * 0.01}in`,
  };

  // Offset tiles get a bleed clip cut flat toward the neighbors they have
  const offsetClips = {};

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
          const aligned = alignSides(pastSides, currentSides);
          rotation = aligned.rotation;
          currentSides = aligned.sides;
        }

        sides.push(clone(currentSides));
      }

      if (layout === "offset") {
        const neighbors = offsetNeighbors(c, page, i);
        clipPath = offsetBleedId(neighbors);
        offsetClips[clipPath] = neighbors;
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

    // Drawn after every tile so neighboring bleed never covers a border
    const borderNodes = cutBorder
      ? addIndex(map)(
          (hex, i) =>
            hex && (
              <g
                transform={`translate(${c.getX(i)} ${c.getY(i)}) scale(${c.hexWidth / 150})`}
                key={`border-${i}`}
              >
                <polygon
                  className="TileSheet--CutBorder"
                  points="-86.0252,0 -43.0126,-74.5 43.0126,-74.5 86.0252,0 43.0126,74.5 -43.0126,74.5"
                  fill="none"
                  stroke="black"
                  strokeWidth={150 / c.hexWidth}
                />
              </g>
            ),
          page,
        )
      : null;

    return (
      <div className="TileSheet--Page" key={`page-${pageIndex}`}>
        <Page
          title={game.info.title}
          component="Tiles"
          current={pageIndex + 1}
          total={pagedTiles.length}
        />
        <Svg style={svgStyle} viewBox={`${viewBoxStr}`}>
          <Cutlines />
          {pins}
          {tileNodes}
          {borderNodes}
          <TilesOverlay
            c={c}
            cells={cellsOf(page)}
            next={
              pageIndex === pagedTiles.length - 1 && page.length < c.perPage
                ? page.length
                : null
            }
          />
        </Svg>
      </div>
    );
  }, pagedTiles);

  // In the editor a full last page (or none) gets a page of its own for the
  // cell that adds a tile. It is no page of the print: no footer, no count.
  const lastFull =
    pagedTiles.length === 0 ||
    pagedTiles[pagedTiles.length - 1].length >= c.perPage;
  if (editing && lastFull) {
    pageNodes.push(
      <div className="TileSheet--Page" key="page-add">
        <Svg style={svgStyle} viewBox={`${viewBoxStr}`}>
          <Cutlines />
          {pins}
          <TilesOverlay c={c} cells={[]} next={0} />
        </Svg>
      </div>,
    );
  }

  return (
    <HtmlEditor page=".TileSheet--Page">
      <ColorContext.Provider value="tile">
        <div
          data-testid={`game-${game.meta.slug}-tiles`}
          className={`tileSheet tileSheet--${layout}`}
        >
          {keys(offsetClips).length > 0 && (
            <svg
              version="1.1"
              xmlns="http://www.w3.org/2000/svg"
              style={{ height: 0, width: 0, position: "absolute" }}
            >
              <defs>
                {map(
                  (id) => (
                    <clipPath id={id} key={id}>
                      <polygon
                        points={offsetBleedPoints(offsetClips[id])
                          .map((p) => p.join(","))
                          .join(" ")}
                      />
                    </clipPath>
                  ),
                  keys(offsetClips),
                )}
              </defs>
            </svg>
          )}
          {pageNodes}
          <TilesTap />
          <PageSetup paper={config.paper} landscape={false} />
        </div>
      </ColorContext.Provider>
    </HtmlEditor>
  );
};

export default TilesPage;
