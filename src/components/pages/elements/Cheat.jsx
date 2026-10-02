import { Link as RouterLink } from "react-router";

import { intersperse, keys, map, max, prop, reduce } from "ramda";

import { games } from "@/data";

const Value = ({ game, field }) => {
  if (game[field]) {
    return game[field];
  } else {
    return (
      <table className="text-sm">
        <tbody>
          {map(
            (p) => (
              <tr key={p.number}>
                <td className="p-2">{p.number}</td>
                <td className="p-2">{p[field]}</td>
              </tr>
            ),
            game.players || [],
          )}
        </tbody>
      </table>
    );
  }
};

const gameRows = map((key) => {
  let game = games[key];

  let players = reduce(max, 0, map(prop("number"), game.players || []));
  let links = null;

  if (game.links) {
    links = intersperse(
      ", ",
      map((name) => {
        let url = game.links[name];
        return (
          <a key={name} className="text-xs hover:underline" href={url}>
            {name}
          </a>
        );
      }, keys(game.links)),
    );
  }

  return (
    <tr key={key} className="border-b align-top">
      <td className="p-2">{key}</td>
      <td className="p-2">
        <RouterLink
          className="text-lg font-medium hover:underline"
          to={`/${key}`}
        >
          {game.info.title}
        </RouterLink>
        {game.info.subtitle && (
          <div className="text-base">{game.info.subtitle}</div>
        )}
        {links && <div>{links}</div>}
      </td>
      <td className="p-2">{game.info.designer}</td>
      <td className="p-2">{players === 0 ? null : players}</td>
      <td className="bank p-2">
        <Value game={game} field="bank" />
      </td>
      <td className="p-2">
        <Value game={game} field="capital" />
      </td>
      <td className="p-2">
        <Value game={game} field="certLimit" />
      </td>
    </tr>
  );
}, keys(games));

const Cheat = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-semibold mb-4">18xx Game Cheat Sheet</h1>
      <div className="overflow-x-auto rounded-md border shadow-xs">
        <table
          aria-label="18xx game cheat sheet"
          className="w-full text-sm text-left"
        >
          <thead>
            <tr className="border-b font-medium">
              <th className="p-2">ID</th>
              <th className="p-2">Title</th>
              <th className="p-2">Designer</th>
              <th className="p-2">Players</th>
              <th className="p-2">Bank</th>
              <th className="p-2">Initial Capital</th>
              <th className="p-2">Cert Limit</th>
            </tr>
          </thead>
          <tbody>{gameRows}</tbody>
        </table>
      </div>
    </div>
  );
};

export default Cheat;
