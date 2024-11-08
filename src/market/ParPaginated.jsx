import { useNavigate } from "react-router-dom";

import Paginate from "../util/Paginate";

import { getParData } from "./util";

import Par from "./Par";

const ParPaginated = ({ config, game }) => {
  const navigate = useNavigate();

  if (!game.stock || !game.stock.par || !game.stock.par.values) {
    navigate(`/games/${game.meta.slug}/`);
  }

  let data = getParData(game.stock, config);

  return (
    <Paginate component="Par" game={game} config={config} data={data}>
      <Par data={data} title={game.info.title} />
    </Paginate>
  );
};

export default ParPaginated;
