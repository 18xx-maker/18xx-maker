import React from "react";
import { colors } from "./data";
import games from "./data/games";
import * as R from "ramda";

const Background = ({ match }) => {
  let game = games[match.params.game];

  let color = colors[game.background.color];
  let title = game.title.title;

  let text = R.map(word => <span>{word}</span>, Array(3000).fill(title));

  return (
    <div className="background" style={{ backgroundColor: color }}>
      <div className="text">{text}</div>
    </div>
  );
};

export default Background;
