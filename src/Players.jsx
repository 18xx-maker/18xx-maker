import React from "react";
import * as R from "ramda";

const Players = ({ players, bank, capital }) => {
  return (
    <div className="players">
      {(bank || capital) && (
        <table className="players__table players__table--static">
          <thead>
            {bank && (
              <tr>
                <th>
                  <i className="fas fa-university" />
                </th>
                <td>{bank}</td>
              </tr>
            )}
            {capital && (
              <tr>
                <th>
                  <i className="fas fa-coins" />
                </th>
                <td>{capital}</td>
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
                {p.capital && <td>{p.capital}</td>}
                {p.bank && <td>{p.bank}</td>}
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
