import React from "react";
import * as R from "ramda";

import Currency from "./util/Currency";

import "./Players.scss";

const Players = ({ players, bank, capital }) => {
  return (
    <div className="players" xmlns="http://www.w3.org/1999/xhtml">
      {(bank || capital) && (
        <table className="players__table players__table--static">
          <thead>
            {bank && (
              <tr>
                <th>
                  <i className="fas fa-university" />
                </th>
                <td><Currency value={bank} type="bank"/></td>
              </tr>
            )}
            {capital && (
              <tr>
                <th>
                  <i className="fas fa-coins" />
                </th>
                <td><Currency value={capital} type="capital"/></td>
              </tr>
            )}
          </thead>
        </table>
      )}
      <table className="players__table players__table--variable">
        <thead>
          <tr>
            {players && (
              <th>
                <i className="fas fa-user-friends" />
              </th>
            )}
            {players && players[0].certLimit && (
              <th>
                <i className="fas fa-certificate" />
              </th>
            )}
            {players && players[0].capital && (
              <th>
                <i className="fas fa-coins" />
              </th>
            )}
            {players && players[0].bank && (
              <th>
                <i className="fas fa-university" />
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {R.map(
            p => (
              <tr key={p.number}>
                <td>{p.number}</td>
                {p.certLimit && <td>{p.certLimit}</td>}
                {p.capital && <td><Currency value={p.capital} type="capital"/></td>}
                {p.bank && <td><Currency value={p.bank} type="bank"/></td>}
              </tr>
            ),
            players || []
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Players;
