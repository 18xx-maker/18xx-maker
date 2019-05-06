import React from "react";
import games from "./data/games";
import Color from "./data/Color";

import PageSetup from "./PageSetup";

import addIndex from "ramda/src/addIndex";
import map from "ramda/src/map";

const Background = ({ match }) => {
  let game = games[match.params.game];

  let color = game.info.background;
  let title = game.info.title;

  let text = addIndex(map)((word, i) => <span key={i}>{word}</span>, Array(2300).fill(title));

  return (
    <Color context="companies">
      {c => (
        <React.Fragment>
          <div className="PrintNotes">
            <div>
              <p>Background is meant to be printed in <b>portait</b> mode</p>
            </div>
          </div>
          <div className="background" style={{ backgroundColor: c(color) }}>
            <div className="text">{text}</div>
            <PageSetup landscape={false}/>
          </div>
        </React.Fragment>
      )}
    </Color>
  );
};

export default Background;
