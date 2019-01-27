import React from "react";
import games from "./data/games";
import {NavLink} from "react-router-dom";

import Tiles from "./nav/Tiles";
import RandomTile from "./RandomTile";

import Color from "./data/Color";

import assoc from "ramda/es/assoc";
import compose from "ramda/es/compose";
import map from "ramda/es/map";
import mapObj from "ramda/es/mapObjIndexed";
import path from "ramda/es/path";
import sortBy from "ramda/es/sortBy";
import values from "ramda/es/values";

import "./Home.scss";

const makeGameNode = game => (
  <li key={game.id} className="game">
    <NavLink to={`/${game.id}/map`}>{game.info.title}</NavLink> by {game.info.designer}
  </li>
);

const Home = () => {
  let gameNodes = compose(map(makeGameNode),
                          sortBy(path(["info","title"])),
                          values,
                          mapObj((game, id) => assoc("id", id, game)))(games);

  return (
    <div className="home">
      <RandomTile/>
      <Color>
        {(c,t) => (
          <React.Fragment>
            <h1>18xx <span>Print and Play Tool</span></h1>
            <p>This site is a react client-side application which can take 18xx game
              definitions written in json display them in a browser ready for
              printing.</p>
            <p>The original purpose was for personal pnp projects. Many games
              displayed on this site are <strong>NOT</strong> licensed for public print and play.
              A lot of great titles are availalbe from <a target="_blank" rel="noopener noreferrer" href="http://www.all-aboardgames.com/">All-Aboard Games</a> and <a target="_blank" rel="noopener noreferrer" href="http://www.goldenspikegames.com/">Golden Spike Games</a>.
              If you are a designer and/or publisher and would like your design
              to not be available either on this site or in the <a href="https://github.com/kelsin/18xx">source code</a> please <a href="mailto:kelsin@valefor.com">let me know</a>!</p>
            <p className="note" style={{backgroundColor:c("offboard"),color:t(c("offboard"))}}>
              <strong>Important:</strong> Please use this site to print copies of games for which you already
              have a license by owning a version of the game. Information about games
              which are available for free print and play can be found <a href="https://boardgamegeek.com/geeklist/58420/18xx-available-pnp">on this geeklist</a>.
            </p>
            <p className="note" style={{backgroundColor:c("yellow"),color:t(c("yellow"))}}>
              <strong>Note:</strong> Some games are still works in progress and in general the rendering of stock markets is not in a good place. Work will continue on this stuff.
            </p>
          </React.Fragment>
        )}
      </Color>
      <h2>Games</h2>
      <ul>
        {gameNodes}
      </ul>
      <h2>Tiles</h2>
      <p>Tiles are defined separately from each game in (currently){" "}
        <a href="https://github.com/kelsin/18xx/blob/master/src/data/tiles.js">one giant file</a>.
        Tiles are defined with the exactly the same format as map hexes. All available tile/hex elements are
        called atoms and examples of the json required for each is <NavLink to="/tiles/atoms">available</NavLink>.</p>
      <p>If you are just interested in printing games from this site, you don't need to worry about these tiles.
        All tiles for games are available on each game's page.</p>
      <Tiles/>
    </div>
  );
};

export default Home;
