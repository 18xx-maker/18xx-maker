import { useNavigate } from "react-router";

import Paginate from "@/components/Paginate";
import Par from "@/components/market/Par";
import { getParData } from "@/util/market";

const ParPaginated = ({ config, game }) => {
  const navigate = useNavigate();

  if (!game.stock || !game.stock.par || !game.stock.par.values) {
    navigate(`/games/${game.meta.slug}/`);
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
