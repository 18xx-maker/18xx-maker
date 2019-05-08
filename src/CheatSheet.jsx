import React from "react";
import { NavLink } from "react-router-dom";

import games from "./data/games";

import keys from "ramda/src/keys";
import map from "ramda/src/map";
import max from "ramda/src/max";
import prop from "ramda/src/prop";
import reduce from "ramda/src/reduce";

import "./CheatSheet.scss";

const gameRows = map(key => {
  let game = games[key];

  let players = reduce(max, 0, map(prop("number"), game.players));

  return (
    <tr key={key}>
      <td>{key}</td>
      <td>
        <NavLink to={`/${key}`}>{game.info.title}</NavLink><br/>
        <span>{game.info.subtitle}</span>
      </td>
      <td>{game.info.designer}</td>
      <td>{players}</td>
      <td className="bank">{game.bank}</td>
      <td></td>
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
            <th>Limits</th>
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
