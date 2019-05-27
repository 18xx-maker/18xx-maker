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
          <Route path="/:game" component={Nav} />
        </Switch>

        <Switch>
          <Route path="/" exact component={Home} />

          <Route path="/cheat" exact component={CheatSheet} />
          <Route path="/config" exact component={Config} />
          <Route path="/docs/:id?" exact component={Docs} />
          <Route path="/logos" exact component={Logos} />

          <Route path="/tiles" component={Tiles} />

          <Route path="/:game" component={Game} />
        </Switch>
        <svg
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
          style={{height:0,width:0,position:"absolute"}}>
          <defs>
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
            <Color>
              {c => (
                <React.Fragment>
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
                  <g id="mountain60">
                    <path
                      d="M -15 -5 L -10 -10 L -5 -5 M 5 -5 L 10 -10 L 15 -5 M -7.5 -7.5 L 0 -15 L 7.5 -7.5"
                      fill="none"
                      stroke={c("mountain")}
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    <text
                      fill={c("black")}
                      fontSize="10"
                      dominantBaseline="hanging"
                      textAnchor="middle"
                      x="0"
                      y="0"
                    >
                      £60
                    </text>
                  </g>
                  <g id="mountain120">
                    <path
                      d="M -15 -5 L -10 -10 L -5 -5 M 5 -5 L 10 -10 L 15 -5 M -7.5 -7.5 L 0 -15 L 7.5 -7.5"
                      fill="none"
                      stroke={c("mountain")}
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    <text
                      fill={c("black")}
                      fontSize="14"
                      dominantBaseline="hanging"
                      textAnchor="middle"
                      x="0"
                      y="-5"
                    >
                      £120
                    </text>
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
                  <linearGradient id="yellow-green" spreadMethod="repeat"
                                  x1="0" x2="0" y1="0" y2="22%">
                    <stop offset="0%" stopColor={c("yellow")}/>
                    <stop offset="50%" stopColor={c("yellow")}/>
                    <stop offset="50%" stopColor={c("green")}/>
                    <stop offset="100%" stopColor={c("green")}/>
                  </linearGradient>
                  <linearGradient id="green-brown" spreadMethod="repeat"
                                  x1="0" x2="0" y1="0" y2="22%">
                    <stop offset="0%" stopColor={c("green")}/>
                    <stop offset="50%" stopColor={c("green")}/>
                    <stop offset="50%" stopColor={c("brown")}/>
                    <stop offset="100%" stopColor={c("brown")}/>
                  </linearGradient>
                  <linearGradient id="brown-gray" spreadMethod="repeat"
                                  x1="0" x2="0" y1="0" y2="22%">
                    <stop offset="0%" stopColor={c("brown")}/>
                    <stop offset="50%" stopColor={c("brown")}/>
                    <stop offset="50%" stopColor={c("gray")}/>
                    <stop offset="100%" stopColor={c("gray")}/>
                  </linearGradient>
                </React.Fragment>
              )}
            </Color>
          </defs>
        </svg>
        <Route exact path="/" component={Footer}/>
      </div>
      <SetSvgColors/>
    </ScrollToTop>
  </Router>
);

export default App;
