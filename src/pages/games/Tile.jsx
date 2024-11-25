import { useNavigate, useParams } from "react-router";

import Hex from "@/Hex";
import Svg from "@/Svg";
import ColorContext from "@/context/ColorContext";
import { tiles as tileDefs } from "@/data";
import { useConfig, useGame } from "@/hooks";
import { getTile } from "@/util";

const TileSheet = () => {
  const navigate = useNavigate();
  const { config } = useConfig();
  const game = useGame();
  const { id } = useParams();
  const { width: hexWidth } = config.tiles;

  if (!game.tiles) {
    navigate(`/games/${game.meta.slug}/`);
  }

  let tile = getTile(tileDefs, game.tiles, id);

  let scale = hexWidth / 150;

  return (
    <ColorContext.Provider value="tile">
      <div className="tile" data-testid={`game-${game.meta.slug}-tile`}>
        <Svg
          className="printElement"
          style={{
            width: `${scale * 200 * 0.01}in`,
            height: `${scale * 200 * 0.01}in`,
          }}
          viewBox={`-100 -100 200 200`}
        >
          <g clipPath={`url(#hexClipPath)`}>
            <Hex hex={tile} id={tile.id} clipPath="hexBleedClipPath" />
          </g>
        </Svg>
      </div>
    </ColorContext.Provider>
  );
};

export default TileSheet;
