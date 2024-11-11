import { useConfig, useGame } from "@/hooks";
import { useBooleanParam } from "@/util/query";

import ParSingle from "@/market/ParSingle";
import ParPaginated from "@/market/ParPaginated";

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
