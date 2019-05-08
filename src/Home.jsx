import React from "react";
import games from "./data/games";
import {NavLink} from "react-router-dom";

import Tiles from "./nav/Tiles";
import RandomTile from "./RandomTile";

import Color from "./data/Color";

import assoc from "ramda/src/assoc";
import compose from "ramda/src/compose";
import map from "ramda/src/map";
import mapObj from "ramda/src/mapObjIndexed";
import path from "ramda/src/path";
import sortBy from "ramda/src/sortBy";
import values from "ramda/src/values";

import "./Home.scss";

const makeGameNode = game => (
  <li key={game.id} className="game">
    <NavLink to={`/${game.id}/map`}>{game.info.title}</NavLink> <em>{game.info.subtitle}</em> by {game.info.designer}
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
              <strong>Important:</strong> Please only use this site to print games for which you have a license by owning the game.
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
      <p>I've also included a single page <NavLink to="/cheat">Cheat Sheet</NavLink> for things often looked up per game.</p>
      <h2>Config</h2>
      <p>You can configure your settings for how you like your 18xx games to look here.</p>
      <ul><li><NavLink to="/config">Config</NavLink></li></ul>
      <h2>Docs</h2>
      <p>You can browser a bunch of documentation about how to use this tool:</p>
      <ul><li><NavLink to="/docs">Docs</NavLink></li></ul>
      <h2>Logos</h2>
      <p>This repo is also holding a collection of company logo SVGs. Please let me know if you have nice SVG's of any others!</p>
      <ul><li><NavLink to="/logos">Logos</NavLink></li></ul>
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
