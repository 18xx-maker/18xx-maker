import React from "react";
import * as R from "ramda";
import { colors, textColor } from "./data";

const Pool = ({ name, notes }) => {
  let notesNode = null;

  if (notes && notes.length > 0) {
    notesNode = (
      <ul className="notes">
        {R.addIndex(R.map)((n,i) => {
          let backgroundColor = colors[n.color || "orange"];
          let color = textColor(n.color || "orange");

          return (
            <li key={`pool-${name}-note-${i}`}>
              <i className={`fas fa-${n.icon || "info"}`} style={{ backgroundColor, color }} />
              {n.note}
            </li>
          );
        }, notes)}
      </ul>
    );
  }

  return (
    <div className="pool">
      <h2>{name}</h2>
      <div className="pool__box">{notesNode}</div>
    </div>
  );
};

export default Pool;
