import RevenuePaginated from "@/components/market/RevenuePaginated";
import RevenueSingle from "@/components/market/RevenueSingle";

import { useConfig, useGame } from "@/hooks";
import { useBooleanParam } from "@/util/query";

const RevenuePage = () => {
  const { config } = useConfig();
  const game = useGame();

  const [paginated] = useBooleanParam("paginated");

  return paginated ? (
    <RevenuePaginated {...{ game, config }} />
  ) : (
    <RevenueSingle {...{ game, config }} />
  );
};

export default RevenuePage;
