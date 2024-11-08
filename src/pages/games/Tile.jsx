import { useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";

import ConfigContext from "../../context/ConfigContext";
import GameContext from "../../context/GameContext";

import { getTile } from "../../util";

import { tiles as tileDefs } from "../../data";

import Svg from "../../Svg";
import Hex from "../../Hex";

import ColorContext from "../../context/ColorContext";

const TileSheet = () => {
  const navigate = useNavigate();
  const { config } = useContext(ConfigContext);
  const { game } = useContext(GameContext);
  const { id } = useParams();
  const { width: hexWidth } = config.tiles;

  if (!game.tiles) {
    navigate(`/games/${game.meta.slug}/`);
  }

  let tile = getTile(tileDefs, game.tiles, id);

  let scale = hexWidth / 150;

  return (
    <ColorContext.Provider value="tile">
      <div className="tile">
        <Svg
          className="printElement"
          style={{
            width: `${scale * 200 * 0.01}in`,
            height: `${scale * 200 * 0.01}in`,
          }}
          viewBox={`-100 -100 200 200`}
        >
          <g mask={`url(#hexMask)`}>
            <Hex hex={tile} id={tile.id} mask="hexBleedMask" />
          </g>
        </Svg>
      </div>
    </ColorContext.Provider>
  );
};

export default TileSheet;
