import React from "react";
import * as R from "ramda";

const Players = ({ players, bank, capital }) => {
  return (
    <div className="players">
      {(bank || capital) && (
        <table>
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
        </table>
      )}
      <table>
        <thead>
          <tr>
            <th>
              <i className="fas fa-user-friends" />
            </th>
            <th>
              <i className="fas fa-certificate" />
            </th>
            <th>
              <i className="fas fa-coins" />
            </th>
          </tr>
        </thead>
        <tbody>
          {R.map(
            p => (
              <tr key={p.number}>
                <td>{p.number}</td>
                <td>{p.certLimit}</td>
                <td>{p.capital}</td>
              </tr>
            ),
            players
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Players;
