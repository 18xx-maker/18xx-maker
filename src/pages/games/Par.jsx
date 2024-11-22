import { useConfig, useGame } from "@/hooks";
import ParPaginated from "@/market/ParPaginated";
import ParSingle from "@/market/ParSingle";
import { useBooleanParam } from "@/util/query";

const Par = () => {
  const { config } = useConfig();
  const game = useGame();

  const [paginated] = useBooleanParam("paginated");

  return paginated ? (
    <ParPaginated {...{ game, config }} />
  ) : (
    <ParSingle {...{ game, config }} />
  );
};

export default Par;
