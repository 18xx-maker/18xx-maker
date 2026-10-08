import { useTranslation } from "react-i18next";

import Map from "@/components/map/Map";
import Svg from "@/components/svg/Svg";

import { MapOrientation } from "@/context/OrientationContext";
import { useConfig, useGame } from "@/hooks";
import { Link } from "@/router";
import { getMapData } from "@/util/map";

const MapPreview = () => {
  const game = useGame();
  const { config } = useConfig();
  const { t } = useTranslation();

  const data = getMapData(game, config.coords, config.tiles.mapWidth, 0);
  if (!data.map) return null;

  return (
    <div
      className="border rounded-xl my-4 max-w-lg overflow-hidden"
      data-testid="game-map-preview"
    >
      <MapOrientation>
        <Svg
          viewBox={`0 0 ${data.totalWidth} ${data.totalHeight}`}
          className="w-full h-auto"
          aria-hidden="true"
          data-testid="game-map-preview-svg"
        >
          <Map name={game.meta.id} game={game} config={config} variation={0} />
        </Svg>
      </MapOrientation>
      <Link
        to={`/games/${game.meta.slug}/map`}
        className="block px-4 py-2 hover:underline"
      >
        {t("game.preview.open")}
      </Link>
    </div>
  );
};

export default MapPreview;
