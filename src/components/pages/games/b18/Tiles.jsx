import { useParams } from "react-router";

import { compose, filter, is, keys, map, propEq, take, uniq } from "ramda";

import Svg from "@/components/Svg";
import Tile from "@/components/Tile";

import ColorContext from "@/context/ColorContext";
import RotateContext from "@/context/RotateContext";
import { tiles as tileDefs } from "@/data";
import { useGame } from "@/hooks";
import { getTile } from "@/util";

const ROTATIONS = [0, 60, 120, 180, 240, 300];

const Tiles = () => {
  const game = useGame();
  let params = useParams();
  let color = params.color;

  let getGameTile = getTile(tileDefs, game.tiles || {});

  let tiles = compose(
    uniq,
    filter(propEq(color, "color")),
    map(getGameTile),
  )(keys(game.tiles));

  let height = game.info.orientation === "horizontal" ? 100 : 116;
  let width = game.info.orientation === "horizontal" ? 116 : 100;

  // Hardcoding tile width here since this is only for b18 output
  let totalWidth = tiles.length * 150;

  // Same as above
  let viewBox =
    game.info.orientation === "horizontal"
      ? "-87.6025 -76 175.205 152"
      : "-76 -87.6025 152 175.205";

  let tileNodes = map((tile) => {
    // Figure out rotations
    let rotations = ROTATIONS;
    if (is(Number, tile.rotations)) {
      rotations = take(tile.rotations, ROTATIONS);
    } else if (is(Array, tile.rotations)) {
      rotations = tile.rotations;
    }
    rotations = map(
      (r) => r + (game.info.orientation === "horizontal" ? 0 : 30),
      rotations,
    );

    return (
      <div
        key={tile.id}
        className={`tile tile-${tile.id} w-[150px] h-[900px] flex flex-col last:m-0`}
      >
        {map(
          (rotation) => (
            <div
              key={`tile-${tile.id}-${rotation}`}
              className="tile-rotation w-[150px] h-[150px]"
            >
              <Svg
                className="mt-0 mx-0 mb-[10px] last:m-0"
                preserveAspectRatio="none"
                style={{ width: `${width}px`, height: `${height}px` }}
                viewBox={viewBox}
              >
                <g transform={`rotate(${rotation})`}>
                  <RotateContext.Provider
                    value={{ fixed: false, angle: rotation }}
                  >
                    <Tile id={tile.id} border={true} gameTiles={game.tiles} />
                  </RotateContext.Provider>
                </g>
              </Svg>
            </div>
          ),
          rotations,
        )}
      </div>
    );
  }, tiles);

  return (
    <ColorContext.Provider value="tile">
      <div className="relative text-left" style={{ width: `${totalWidth}px` }}>
        <div className="m-0 flex flex-nowrap h-[900px]">{tileNodes}</div>
      </div>
      <style>{`@media print {@page {size: ${totalWidth}px 900px;}}`}</style>
    </ColorContext.Provider>
  );
};

export default Tiles;
