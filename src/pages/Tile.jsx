import { useParams } from "react-router-dom";

import capability from "@/util/capability";
import Svg from "../Svg";
import Tile from "../Tile";

const TilePage = () => {
  let params = useParams();
  let id = params.id;

  let handler = () => {
    if (capability.electron) {
      window.api.png(`/tile/${id}`);
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
