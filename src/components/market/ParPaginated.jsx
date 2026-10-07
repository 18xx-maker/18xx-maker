import Par from "@/components/market/Par";
import Paginate from "@/components/page/Paginate";

import { Redirect } from "@/router";
import { getParData } from "@/util/market";

const ParPaginated = ({ config, game }) => {
  if (!game.stock || !game.stock.par || !game.stock.par.values) {
    return <Redirect to={`/games/${game.meta.slug}/`} replace />;
  }

  let data = getParData(game.stock, config);

  return (
    <div className="stock" data-testid={`game-${game.meta.slug}-par-paginated`}>
      <Paginate component="Par" game={game} config={config} data={data}>
        <Par data={data} title={game.info.title} />
      </Paginate>
    </div>
  );
};

export default ParPaginated;
