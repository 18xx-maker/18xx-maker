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

const terrainIcon = (id, color, translate, scale, path) => (
  <g id={id}>
    <path
      transform={`translate(0 ${translate + 1}) scale(${scale})`}
      d={path}
      fill="none"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      transform={`translate(0 ${translate}) scale(${scale})`}
      d={path}
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </g>
);

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
              <polygon points="-86.6025,0 -43.30125,-75 43.30125,-75 86.6025,0 43.30125,75 -43.30125,75"
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
                  {terrainIcon("mountain",
                               p("mountain"),
                               1,
                               0.75,
                               "M -15 0 L -10 -5 L -5 0 M 5 0 L 10 -5 L 15 0 M -7.5 -2.5 L 0 -10 L 7.5 -2.5")}
                  {terrainIcon("water",
                               p("water"),
                               5,
                               0.60,
                               "M -17.5 -5 C -17.5 0, -7.5 0, -7.5 -5 C -7.5 0, 2.5 0, 2.5 -5 C 2.5 0, 12.5 0, 12.5 -5" +
                               "M -12.5 -12.5 C -12.5 -7.5, -2.5 -7.5, -2.5 -12.5 C -2.5 -7.5, 7.5 -7.5, 7.5 -12.5 C 7.5 -7.5, 17.5 -7.5, 17.5 -12.5")}
                  {terrainIcon("river",
                               p("water"),
                               3,
                               0.70,
                               "M -15 -7 Q -7.5 -15, 0 -7 S 7.5 1, 15 -7" +
                               "M -15 -2  Q -7.5 -10, 0 -2  S 7.5 6, 15 -2")}
                  {terrainIcon("swamp",
                               p("land"),
                               3,
                               0.75,
                               "M -10 0 Q -10 -5, -15 -5 M -10 0 Q -10 -5, -5 -5" +
                               "M 0 -5 Q 0 -10, -5 -10 M 0 -5 Q 0 -10, 5 -10" +
                               "M 10 0 Q 10 -5, 15 -5 M 10 0 Q 10 -5, 5 -5")}
                  {terrainIcon("cactus",
                               p("land"),
                               10,
                               1,
                               "M 0 0 L 0 -20 M 0 -5 Q -5 -5, -5 -10 M 0 -10 Q 5 -10, 5 -15")}
                  <g id="bridge">
                    <rect
                      width="20"
                      height="1"
                      x="-10"
                      y="2"
                      fill={c("black")}
                      stroke={c("black")}
                      strokeWidth="1"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <rect
                      width="1"
                      height="16"
                      x="4"
                      y="-8"
                      fill={c("black")}
                      stroke={c("black")}
                      strokeWidth="1"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <rect
                      width="1"
                      height="16"
                      x="-5"
                      y="-8"
                      fill={c("black")}
                      stroke={c("black")}
                      strokeWidth="1"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M -4 -8 C -3 -1 3 -1 4 -8"
                      fill="none"
                      stroke={c("black")}
                      strokeWidth="1"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M -10 2 C -7 2 -5 -5 -5 -8"
                      fill="none"
                      stroke={c("black")}
                      strokeWidth="1"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M 10 2 C 7 2 5 -5 5 -8"
                      fill="none"
                      stroke={c("black")}
                      strokeWidth="1"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </g>
                  <g id="boat">
                    <polygon
                      points="9,2 3,2 3,-10"
                      fill={c("orange")}
                      stroke={c("black")}
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <polygon
                      points="-6,2 0,2 0,-8"
                      fill={c("orange")}
                      stroke={c("black")}
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M -10 5 C -6 12 6 12 10 5 L -10 5"
                      fill={c("orange")}
                      stroke={c("black")}
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </g>
                  <g id="tracks">
                    <path
                      d="M -10 -3 L 10 -3"
                      fill="none"
                      stroke={c("black")}
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M -10 3 L 10 3"
                      fill="none"
                      stroke={c("black")}
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M -7 -6 L -7 6"
                      fill="none"
                      stroke={c("black")}
                      strokeWidth="1"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M -2 -6 L -2 6"
                      fill="none"
                      stroke={c("black")}
                      strokeWidth="1"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M 3 -6 L 3 6"
                      fill="none"
                      stroke={c("black")}
                      strokeWidth="1"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M 8 -6 L 8 6"
                      fill="none"
                      stroke={c("black")}
                      strokeWidth="1"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </g>
                  <g id="charter">
                    <rect
                      width="20"
                      height="12"
                      x="-10"
                      y="-6"
                      rx="3"
                      ry="3"
                      fill="none"
                      stroke={c("black")}
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <rect
                      width="20"
                      height="5"
                      x="-10"
                      y="-6"
                      rx="3"
                      ry="3"
                      fill={c("red")}
                      stroke={c("black")}
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </g>
                  <g id="share">
                    <rect
                      width="20"
                      height="12"
                      x="-10"
                      y="-6"
                      rx="3"
                      ry="3"
                      fill="none"
                      stroke={c("black")}
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <rect
                      width="7"
                      height="12"
                      x="-10"
                      y="-6"
                      rx="3"
                      ry="3"
                      fill={c("purple")}
                      stroke={c("black")}
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </g>
                  <g id="mail">
                    <rect
                      width="20"
                      height="12"
                      x="-10"
                      y="-6"
                      fill={c("cyan")}
                      stroke={c("black")}
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M -10 -6 L 0 0 L 10 -6 L -10 -6"
                      fill={c("cyan")}
                      stroke={c("black")}
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </g>
                  <g id="tree">
                    <rect
                      width="4"
                      height="8"
                      x="-2"
                      y="1"
                      fill={c("mountain")}
                      stroke={c("mountain")}
                      strokeWidth="1"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <polygon
                      points="-6,3 0,-10 6,3"
                      fill={c("land")}
                      stroke={c("land")}
                      strokeWidth="1"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </g>
                  <g id="meat" transform="translate(0 2)">
                    <path
                      d="M 0 0 c 7 0, 2 -5, 12 -5 C 5 -4, 7 4, 0 4 C -7 4, -5 -4, -12 -5 C -2 -5, -7 0, 0 0"
                      fill={c("mountain")}
                      stroke={c("mountain")}
                      strokeWidth="1"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <rect
                      width="2"
                      height="5"
                      x="-1"
                      y="-0.5"
                      fill="black"
                      stroke="black"
                      strokeWidth="1"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </g>
                  <g id="coal">
                    <path
                      d="M -7 7 L 4 -4"
                      fill={c("black")}
                      stroke={c("black")}
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M -5 -9 Q 12 -12, 9 5 Q 8 -8, -5 -9"
                      fill={c("black")}
                      stroke={c("black")}
                      strokeWidth="1"
                      strokeLinecap="miter"
                      strokeLinejoin="miter"
                    />
                  </g>
                  <g id="medium-city">
                    <circle
                      fill={c("border")}
                      stroke={c("track")}
                      strokeWidth="2"
                      cx="0"
                      cy="0"
                      r="10"
                    />
                    <circle
                      fill={c("track")}
                      cx="0"
                      cy="0"
                      r="6"
                    />
                  </g>
                  <g id="port">
                    <path
                      d="M 0 -6 L 0 8"
                      fill={c("water")}
                      stroke={c("water")}
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M -9 5 C -7 11, 7 11, 9 5 C 7 9, -7 9, -9 5"
                      fill="none"
                      stroke={c("water")}
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M -5 -3 L 5 -3"
                      fill={c("water")}
                      stroke={c("water")}
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <circle
                      cx="0"
                      cy="-8"
                      r="2"
                      fill="none"
                      stroke={c("water")}
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </g>
                  <path id="cityPath" d="M 0 30 A 30 30 0 0 1 0 -30 A 30 30 0 0 1 0 30" />
                  <path
                    id="cityPathReverse"
                    d="M 0 -30 A 30 30 0 0 0 0 30 A 30 30 0 0 0 0 -30"
                  />
                  <path
                    id="city2Path"
                    d="M 0 30 L -25 30 A 30 30 0 0 1 -25 -30 L 25 -30 A 30 30 0 0 1 25 30 L 0 30"
                  />
                  <path
                    id="city2PathReverse"
                    d="M 0 -30 L -25 -30 A 30 30 0 0 0 -25 30 L 25 30 A 30 30 0 0 0 25 -30 L 0 -30"
                  />
                  <path
                    id="city3Path"
                    d="M 0 42 L -25 42 A 30 30 0 0 1 -47 -1 L -25 -40 A 30 30 0 0 1 25 -40 L 47 -1 A 30 30 0 0 1 25 42 L 0 42"
                  />
                  <path
                    id="city3PathReverse"
                    d="M 0 42 L 25 42 A 30 30 0 0 0 47 -1 L 25 -40 A 30 30 0 0 0 -25 -40 L -47 -1 A 30 30 0 0 0 -25 42 L 0 42"
                  />
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
