import React from "react";

import SetSvgColors from "./data/SetSvgColors";
import ScrollToTop from "./ScrollToTop";
import Color from "./data/Color";

import Nav from "./nav/Nav";

import CheatSheet from "./CheatSheet.jsx";
import Config from "./Config.jsx";
import Docs from "./docs";
import Logos from "./Logos";

import Tiles from "./tiles";

import Home from "./Home";
import Game from "./Game";

import Footer from "./Footer";

import { BrowserRouter as Router, Route, Switch } from "react-router-dom";

const App = () => (
  <Router>
    <ScrollToTop>
      <div className="App">
        <Switch>
          <Route path="/" exact />
          <Route path="/:game">
            <Nav />
          </Route>
        </Switch>
        <Switch>
          <Route path="/" exact>
            <Home />
          </Route>
          <Route path="/cheat" exact>
            <CheatSheet />
          </Route>
          <Route path="/config" exact>
            <Config />
          </Route>
          <Route path="/docs/:id?" exact>
            <Docs />
          </Route>
          <Route path="/logos" exact>
            <Logos />
          </Route>
          <Route path="/tiles">
            <Tiles />
          </Route>
          <Route path="/:game">
            <Game />
          </Route>
        </Switch>
        <svg
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
          style={{height:0,width:0,position:"absolute"}}>
          <defs>
            <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5"
                    markerWidth="5" markerHeight="5"
                    markerUnits="strokeWidth"
                    orient="auto-start-reverse">
              <path d="M 0 0 L 8 4 L 8 6 L 0 10 z"
                    strokeLinejoin="round"
                    strokeLinecap="round" />
            </marker>
            <mask id="hexMask">
              <rect x="-100" y="-100" width="200" height="200" fill="black"/>
              <polygon points="-86.0252,0 -43.0126,-74.5 43.0126,-74.5 86.0252,0 43.0126,74.5 -43.0126,74.5"
                       fill="white"
                       stroke="white"
                       strokeWidth="2" />
            </mask>
            <mask id="hexBleedMask">
              <rect x="-100" y="-100" width="200" height="200" fill="black"/>
              <polygon points="-98.1495,0 -49.07475,-85 49.07475,-85 98.1495,0 49.07475,85 -49.07475,85"
                       fill="white"
                       stroke="white"
                       strokeWidth="2" />
            </mask>
            <mask id="hexBleedMaskOffset">
              <rect x="-100" y="-100" width="200" height="200" fill="black"/>
              <polygon points="-86.6025,0 -92.376,-9.999995337 -54.84825,-75 -43.30125,-75 -37.52775,-85 37.52775,-85 43.30125,-75 54.84825,-75 92.376,-9.999995337 86.6025,0 92.376,9.999995337 54.84825,75 43.30125,75 37.52775,85 -37.52775,85 -43.30125,75 -54.84825,75 -92.376,9.999995337"
                       fill="white"
                       stroke="white"
                       strokeWidth="2" />
            </mask>
            <mask id="hexBleedMaskDie">
              <rect x="-100" y="-100" width="200" height="200" fill="black"/>
              <polygon points="-98.1495,0 -54.84825,-75 54.84825,-75 98.1495,0 54.84825,75 -54.84825,75"
                       fill="white"
                       stroke="white"
                       strokeWidth="2" />
            </mask>
            <mask id="hexBleedMaskDieTop">
              <rect x="-100" y="-100" width="200" height="200" fill="black"/>
              <polygon points="-98.1495,0 -49.07475,-85 49.07475,-85 98.1495,0 54.84825,75 -54.84825,75"
                       fill="white"
                       stroke="white"
                       strokeWidth="2" />
            </mask>
            <mask id="hexBleedMaskDieBottom">
              <rect x="-100" y="-100" width="200" height="200" fill="black"/>
              <polygon points="-98.1495,0 -54.84825,-75 54.84825,-75 98.1495,0 49.07475,85 -49.07475,85"
                       fill="white"
                       stroke="white"
                       strokeWidth="2" />
            </mask>
            <Color context="companies">
              {(c,t,s,p) => (
                <React.Fragment>
                  <path id="cityPath" d="M 0 30 A 30 30 0 0 1 0 -30 A 30 30 0 0 1 0 30" />
                  <path id="cityPathReverse" d="M 0 -30 A 30 30 0 0 0 0 30 A 30 30 0 0 0 0 -30" />
                  <path id="city2Path" d="M 0 30 L -25 30 A 30 30 0 0 1 -25 -30 L 25 -30 A 30 30 0 0 1 25 30 L 0 30" />
                  <path id="city2PathReverse" d="M 0 -30 L -25 -30 A 30 30 0 0 0 -25 30 L 25 30 A 30 30 0 0 0 25 -30 L 0 -30" />
                  <path id="city3Path" d="M 0 44 L -28 44 A 30 30 0 0 1 -50 -1 L -25 -44 A 30 30 0 0 1 25 -44 L 50 -1 A 30 30 0 0 1 28 44 L 0 44" />
                  <path id="city3PathReverse" d="M 0 44 L 28 44 A 30 30 0 0 0 50 -1 L 25 -44 A 30 30 0 0 0 -25 -44 L -50 -1 A 30 30 0 0 0 -28 44 L 0 44" />
                  <path id="city4Path" d="M 0 53 L -25 53 A 30 30 0 0 1 -53 25 L -53 -25 A 30 30 0 0 1 -25 -53 L 25 -53 A 30 30 0 0 1 53 -25 L 53 25 A 30 30 0 0 1 25 53 L 0 53" />
                  <path id="city4PathReverse" d="M 0 53 L 25 53 A 30 30 0 0 0 53 25 L 53 -25 A 30 30 0 0 0 25 -53 L -25 -53 A 30 30 0 0 0 -53 -25 L -53 25 A 30 30 0 0 0 -25 53 L 0 53" />
                </React.Fragment>
              )}
            </Color>
          </defs>
        </svg>
        <Route exact path="/">
          <Footer />
        </Route>
      </div>
      <SetSvgColors />
    </ScrollToTop>
  </Router>
);

export default App;
