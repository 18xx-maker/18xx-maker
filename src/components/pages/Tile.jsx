import { useLocation, useParams } from "react-router";

import Svg from "@/components/Svg";
import Tile from "@/components/Tile";

import { useConfig, useGame } from "@/hooks";
import capability from "@/util/capability";
import { planSingle } from "@/util/exportPlan";

const TilePage = () => {
  let params = useParams();
  let location = useLocation();
  const game = useGame();
  const { defaultConfig, userConfig, storedConfig } = useConfig();
  let id = params.id;

  let handler = () => {
    if (capability.electron) {
      window.api
        .export(
          planSingle(
            game,
            { defaultConfig, userConfig, storedConfig },
            location,
            "png",
          ),
        )
        .catch(console.error);
    }
  };

  return (
    <div onClick={handler}>
      <Svg
        key={id}
        width="200"
        height="200"
        viewBox="-100 -100 200 200"
        transform="rotate(-90)"
      >
        <Tile id={id} width={150} x={0} y={0} />
      </Svg>
    </div>
  );
};

export default TilePage;
