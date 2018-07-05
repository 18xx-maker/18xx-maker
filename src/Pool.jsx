import React from "react";
import { colors, textColor } from "./data";

const Pool = ({ label, notes }) => {
  let notesNode = null;

  if (notes && notes.length > 0) {
    notesNode = (
      <ul class="notes">
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
    <div class="pool">
      <h2>{label}</h2>
      <div class="pool__box">{notesNode}</div>
    </div>
  );
};

export default Pool;
