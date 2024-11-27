import { useNavigate } from "react-router";

import { addIndex, ascend, keys, map, sortWith } from "ramda";

import Svg from "@/components/Svg";
import Tile from "@/components/Tile";
import ColorContext from "@/context/ColorContext";
import { tiles } from "@/data";
import { useGame } from "@/hooks";
import { getTile } from "@/util";

const getCol = (tile) => {
  switch (tile.color) {
    case "yellow":
      return 1;
    case "green":
      return 2;
    case "brown":
      return 3;
    default:
      return 4;
  }
};

const TileManifest = () => {
  const navigate = useNavigate();
  const game = useGame();

  if (!game.tiles) {
    navigate(`/games/${game.meta.slug}/`);
  }

  let ids = sortWith(
    [
      ascend((id) => Number(id.split("|")[0] || 0)),
      ascend((id) => Number(id.split("|")[1] || 0)),
    ],
    keys(game.tiles),
  );

  let tileNodes = addIndex(map)((id, i) => {
    let [idBase, idExtra] = id.split("|");
    let tile = getTile(tiles, game.tiles, id);
    if (!tile) return null;
    let quantity = tile.quantity;
    return (
      <div
        key={i}
        className="TileManifest--Tile"
        style={{ gridColumn: `${getCol(tile)} / span 1` }}
      >
        <div className="TileManifest--Id">
          {idBase}
          {idExtra && ` (${idExtra})`}
        </div>
        <div className="TileManifest--Image">
          <Svg
            key={`${id}-${i}`}
            style={{
              height: "0.5in",
              width: "0.5in",
            }}
            viewBox={`-86.6025 -86.6025 173.205 173.205`}
          >
            <Tile id={id} gameTiles={game.tiles} />
          </Svg>
        </div>
        <div className="TileManifest--Quantity">{quantity}x</div>
      </div>
    );
  }, ids);

  return (
    <ColorContext.Provider value="tile">
      <div
        className="TileManifest printElement"
        data-testid={`game-${game.meta.slug}-tile-manifest`}
      >
        <div className="TileManifest--Title">
          {game.info.title} Tile Manifest
        </div>
        {tileNodes}
      </div>
    </ColorContext.Provider>
  );
};

export default TileManifest;
