import { useMemo } from "react";

import * as R from "ramda";

import Hex from "@/components/Hex";
import BorderTexts from "@/components/map/BorderTexts";
import Borders from "@/components/map/Borders";
import Coordinates from "@/components/map/Coordinates";
import Lines from "@/components/map/Lines";
import MapMarket from "@/components/map/MapMarket";
import MapPlayers from "@/components/map/MapPlayers";
import MapRoundTracker from "@/components/map/MapRoundTracker";
import Title from "@/components/map/Title";

import { multiDefaultTo } from "@/util";
import { getMapData, toAlpha, toCoords } from "@/util/map";

const Map = ({ name, game, config, variation }) => {
  const coords = config.coords;
  const hexWidth = config.tiles.mapWidth;

  let data = useMemo(
    () => getMapData(game, coords, hexWidth, variation),
    [game, coords, hexWidth, variation],
  );

  if (!data.map) {
    return null;
  }

  let mapHexes = R.chain((hex) => {
    return R.map(
      ([x, y]) => {
        let translate = `translate(${data.hexX(x, y)} ${data.hexY(x, y)})`;
        let scale = `scale(${data.scale})`;
        let coord = `${toAlpha(y)}${x}`;
        let opacity = multiDefaultTo("1.0", hex.opacity, data.map.opacity);
        return (
          <g
            transform={`${translate} ${scale}`}
            key={`hex-${name}-${hex.variation}-${coord}`}
          >
            <Hex
              hex={hex}
              border={true}
              transparent={game.info.transparent}
              map={true}
              id={coords === "inside" && coord}
              opacity={opacity}
            />
          </g>
        );
      },
      R.map(toCoords, hex.hexes || []),
    );
  }, data.hexes);

  let showTitle = data.title !== false;

  return (
    <>
      {mapHexes}
      <Coordinates {...data} />
      {showTitle && (
        <Title game={game} variation={variation} hexWidth={hexWidth} />
      )}
      <MapMarket mapMarket={data.map.market} hexWidth={hexWidth} />
      <MapRoundTracker
        roundTracker={data.map.roundTracker}
        hexWidth={hexWidth}
      />
      <MapPlayers players={data.map.players} hexWidth={hexWidth} />
      <Lines data={data} />
      <Borders data={data} />
      <BorderTexts data={data} />
    </>
  );
};

export default Map;
