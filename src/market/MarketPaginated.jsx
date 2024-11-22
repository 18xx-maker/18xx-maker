import { useNavigate } from "react-router-dom";

import Paginate from "../util/Paginate";
import Market from "./Market";
import { getMarketData } from "./util";

const MarketPaginated = ({ config, game }) => {
  const navigate = useNavigate();

  if (!game.stock || !game.stock.market) {
    navigate(`/games/${game.meta.slug}/`);
  }

  let data = getMarketData(game.stock, config);

  return (
    <Paginate component="Market" game={game} config={config} data={data}>
      <Market data={data} game={game} config={config} title={game.info.title} />
    </Paginate>
  );
};

export default MarketPaginated;
