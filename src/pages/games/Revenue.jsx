import { useConfig, useGame } from "@/hooks";
import RevenuePaginated from "@/market/RevenuePaginated";
import RevenueSingle from "@/market/RevenueSingle";
import { useBooleanParam } from "@/util/query";

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
