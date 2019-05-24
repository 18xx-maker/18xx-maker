import React from "react";
import { NavLink } from "react-router-dom";

import games from "./data/games";

import keys from "ramda/src/keys";
import map from "ramda/src/map";
import max from "ramda/src/max";
import prop from "ramda/src/prop";
import reduce from "ramda/src/reduce";

import "./CheatSheet.scss";

const Value = ({game, field}) => {
  if (game[field]) {
    return game[field];
  } else {
    return (
      <table>
        <tbody>
          {map(p=> (
            <tr key={p.number}>
              <th>{p.number}</th>
              <td>{p[field]}</td>
            </tr>
          ), game.players || [])}
        </tbody>
      </table>
    );
  }
};

const gameRows = map(key => {
  let game = games[key];

  let players = reduce(max, 0, map(prop("number"), game.players || []));

  return (
    <tr key={key}>
      <td>{key}</td>
      <td>
        <NavLink to={`/${key}`}>{game.info.title}</NavLink><br/>
        <span>{game.info.subtitle}</span>
      </td>
      <td>{game.info.designer}</td>
      <td>{players === 0 ? null : players}</td>
      <td className="bank"><Value game={game} field="bank"/></td>
      <td><Value game={game} field="capital"/></td>
      <td><Value game={game} field="certLimit"/></td>
    </tr>
  );
}, keys(games));

const CheatSheet = () => {
  return (
    <div className="cheat">
      <h1>Cheat Sheat</h1>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Title</th>
            <th>Designer</th>
            <th>Players</th>
            <th>Bank</th>
            <th>Initial Capital</th>
            <th>Cert Limit</th>
          </tr>
        </thead>
        <tbody>
          {gameRows}
        </tbody>
      </table>
    </div>
  );
};

export default CheatSheet;
