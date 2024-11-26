import RoundTracker, { getRoundTrackerData } from "@/RoundTracker";
import { useConfig, useGame } from "@/hooks";

const Rounds = () => {
  const game = useGame();
  const { config } = useConfig();

  const rounds = game.rounds;
  const size = config.tokens.stationTokenSize;
  const type = (game.roundTracker && game.roundTracker.type) || "row";

  const data = getRoundTrackerData(rounds, size, type);

  return (
    <svg
      viewBox={`${data.startX} ${data.startY} ${data.width} ${data.height}`}
      width={data.css.width}
      height={data.css.height}
    >
      <RoundTracker {...{ rounds, size, type }} />
    </svg>
  );
};

export default Rounds;
