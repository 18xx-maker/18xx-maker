import Movement from "@/components/market/Movement";

import { useConfig, useGame } from "@/hooks";

const MapMovement = ({ movement, hexWidth }) => {
  const game = useGame();
  const { config } = useConfig();

  if (!movement || !config.maps.movement || !game.stock?.movement) {
    return null;
  }

  let scale = hexWidth / 150.0;
  let x = movement.x * scale + 50;
  let y = movement.y * scale + 50;

  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <Movement title="Share price movement" movement={game.stock.movement} />
    </g>
  );
};

export default MapMovement;
