import React from "react";
import * as R from "ramda";

const Players = ({ players }) => {
  return (
    <div className="players">
      <table>
        <thead>
          <tr>
            <th>Players</th>
            <th>Certificate Limit</th>
            <th>Initial Capital</th>
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
