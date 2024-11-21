import { useBooleanParam } from "@/util/query";
import { useConfig, useGame } from "@/hooks";

import RevenueSingle from "@/market/RevenueSingle";
import RevenuePaginated from "@/market/RevenuePaginated";

const Revenue = () => {
  const { config } = useConfig();
  const game = useGame();

  const [paginated] = useBooleanParam("paginated");

  return paginated ? (
    <RevenuePaginated {...{ game, config }} />
  ) : (
    <RevenueSingle {...{ game, config }} />
  );
};

export default Revenue;
