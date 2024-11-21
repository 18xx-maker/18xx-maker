import RoundTracker from "@/RoundTracker";
import { useConfig, useGame } from "@/hooks";

const MapRoundTracker = ({ roundTracker, hexWidth }) => {
  const game = useGame();
  const { config } = useConfig();

  if (!roundTracker) {
    return null;
  }

  let scale = hexWidth / 150.0;
  let x = (roundTracker.x || 0) * scale + 50;
  let y = (roundTracker.y || 0) * scale + 50;

  if (!config.maps.roundTracker) {
    return null;
  }

  let rounds = game.rounds;
  let size = config.tokens.marketTokenSize;
  let type = roundTracker.type || "row";
  let rotation = roundTracker.rotation || 0;

  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <RoundTracker {...{ rounds, size, type, rotation }} />
    </g>
  );
};

export default MapRoundTracker;
