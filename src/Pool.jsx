import React from "react";
import { colors, textColor } from "./data";

const Pool = ({ name, notes }) => {
  let notesNode = null;

  if (notes && notes.length > 0) {
    notesNode = (
      <ul className="notes">
        {notes.map(n => {
          let backgroundColor = colors[n.color || "orange"];
          let color = textColor(n.color || "orange");

          return (
            <li>
              <span style={{ backgroundColor, color }}>!</span>
              {n.note}
            </li>
          );
        })}
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
