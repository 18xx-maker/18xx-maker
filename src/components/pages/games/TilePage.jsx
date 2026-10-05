import { Navigate, useParams } from "react-router";

import Hex from "@/components/Hex";
import HtmlEditor from "@/components/HtmlEditor";
import Svg from "@/components/Svg";

import ColorContext from "@/context/ColorContext";
import { tiles as tileDefs } from "@/data";
import { useConfig, useGame } from "@/hooks";
import { getTile } from "@/util";
import { getTileScale } from "@/util/sizes";

const TilePage = () => {
  const { config } = useConfig();
  const game = useGame();
  const { id } = useParams();
  const { width: hexWidth } = config.tiles;

  if (!game.tiles) {
    return <Navigate to={`/games/${game.meta.slug}/`} replace />;
  }

  let tile = getTile(tileDefs, game.tiles, id);

  let scale = getTileScale(hexWidth);

  return (
    <HtmlEditor>
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
    </HtmlEditor>
  );
};

export default TilePage;
