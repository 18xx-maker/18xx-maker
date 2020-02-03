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
            <h1>18xx Maker</h1>
            <p>This site is a react client-side application which can take 18xx game
              definitions written in json display them in a browser ready for
              printing. The original purpose of this site was for personal pnp projects. <NavLink to="/docs">Read more</NavLink> on our docs page.</p>
            <p>If you are a designer and/or publisher and would like your design
              to be available on this site please <a href="mailto:kelsin@valefor.com">let me know</a>!</p>
            <p>If you are looking for places to buy 18xx games please check out <a target="_blank" rel="noopener noreferrer" href="http://www.all-aboardgames.com/">All-Aboard Games</a>, <a target="_blank" rel="noopener noreferrer" href="http://www.goldenspikegames.com/">Golden Spike Games</a>, <a href="http://18xx-marflow-games.de/english-new/index.html">Marflow Games</a>, and <a href="https://www.gmtgames.com/">GMT Games</a> as places where you can buy full 18xx games ready to play.</p>
            <p className="note warning">
              <strong>Important:</strong> Please do not use this site to print games that you don't have a license to print. This tool is not meant to enable piracy. Please support our 18xx designers, developers and publishers.
            </p>
            <p className="note wip">
              <strong>Note:</strong> Some games are still works in progress. Please submit any bugs found as <a href="https://github.com/kelsin/18xx/issues">issues on github</a>!
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
      <h2>Donations</h2>
      <p>I've been asked about donation buttons; if you find this software
        useful to you and would like to donate money towards its development
        you can do so via <a href="https://paypal.me/kelsin">paypal</a> or <a href="https://cash.me/$kelsin">square cash</a>.</p>
    </div>
  );
};

export default Home;
