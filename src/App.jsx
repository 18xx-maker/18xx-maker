import React from "react";

import ScrollToTop from "./ScrollToTop";
import Color from "./data/Color";

import Nav from "./nav/Nav";

import Tiles from "./Tiles";
import SingleTile from "./SingleTile";
import Atoms from "./atoms";
import Positioning from "./Positioning";

import Background from "./Background";
import Cards from "./cards";
import Charters from "./Charters";
import Minors from "./Minors";
import Home from "./Home";
import IPO from "./IPO";
import Revenue from "./Revenue";
import Tokens from "./Tokens";

import TileSheet from "./TileSheet";
import TileManifest from "./TileManifest";

import MapPaginated from "./MapPaginated";
import MapSingle from "./MapSingle";

import Stock from "./Stock";
import StockPaginated from "./StockPaginated";

import Footer from "./Footer";

import B18Tiles from "./b18/Tiles";

import { BrowserRouter as Router, Route, Switch } from "react-router-dom";

const App = () => (
  <Router>
    <ScrollToTop>
      <div className="App">
        <Switch>
          <Route exact path="/"/>
          <Route path="/:game" component={Nav}/>
        </Switch>

        <Switch>
          <Route exact path="/" component={Home} />

          <Route exact path="/tiles" component={Tiles} />
          <Route path="/tiles/atoms" component={Atoms} />
          <Route path="/tiles/positioning" component={Positioning} />
          <Route path="/tiles/:id" component={SingleTile} />

          <Route path="/:game/background" component={Background} />
          <Route path="/:game/cards" component={Cards} />
          <Route path="/:game/charters" component={Charters} />
          <Route path="/:game/minors" component={Minors} />
          <Route path="/:game/ipo" component={IPO} />
          <Route exact path="/:game/map" component={MapSingle} />
          <Route exact path="/:game/map-paginated" component={MapPaginated} />
          <Route path="/:game/map/:variation" component={MapSingle} />
          <Route
            path="/:game/map-paginated/:variation"
            component={MapPaginated}
          />
          <Route path="/:game/revenue" component={Revenue} />
          <Route exact path="/:game/market" component={Stock} />
          <Route path="/:game/market-paginated" component={StockPaginated} />
          <Route path="/:game/tiles" component={TileSheet} />
          <Route path="/:game/manifest" component={TileManifest} />
          <Route path="/:game/tokens" component={Tokens} />

          <Route path="/:game/b18-tiles-:color" component={B18Tiles} />
        </Switch>
        <svg
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
          style={{height:0,width:0,position:"absolute"}}>
          <defs>
            <clipPath id="hexClip">
              <polygon points="-86.6025,0 -43.30125,-75 43.30125,-75 86.6025,0 43.30125,75 -43.30125,75"
                       fill="black"
                       stroke="black"
                       strokeWidth="2" />
            </clipPath>
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
                                  x1="0" x2="0" y1="0" y2="16.6667%">
                    <stop offset="0%" stopColor={c("yellow")}/>
                    <stop offset="50%" stopColor={c("yellow")}/>
                    <stop offset="50%" stopColor={c("green")}/>
                    <stop offset="100%" stopColor={c("green")}/>
                  </linearGradient>
                  <linearGradient id="green-brown" spreadMethod="repeat"
                                  x1="0" x2="0" y1="0" y2="16.6667%">
                    <stop offset="0%" stopColor={c("green")}/>
                    <stop offset="50%" stopColor={c("green")}/>
                    <stop offset="50%" stopColor={c("brown")}/>
                    <stop offset="100%" stopColor={c("brown")}/>
                  </linearGradient>
                  <linearGradient id="brown-gray" spreadMethod="repeat"
                                  x1="0" x2="0" y1="0" y2="16.6667%">
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
        <Footer/>
      </div>
    </ScrollToTop>
  </Router>
);

export default App;
