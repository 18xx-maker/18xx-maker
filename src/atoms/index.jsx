import React from "react";
import * as R from "ramda";

import { colors } from "../data";

import Svg from "../Svg";

import Border from "./Border";
import Bridge from "./Bridge";
import CenterTown from "./CenterTown";
import City from "./City";
import Company from "./Company";
import Divide from "./Divide";
import Hex from "./Hex";
import Icon from "./Icon";
import Id from "./Id";
import Industry from "./Industry";
import Label from "./Label";
import Mountain from "./Mountain";
import OffBoardRevenue from "./OffBoardRevenue";
import OffBoardTrack from "./OffBoardTrack";
import RouteBonus from "./RouteBonus";
import Swamp from "./Swamp";
import Terrain from "./Terrain";
import Town from "./Town";
import Track from "./Track";
import Tunnel from "./Tunnel";
import Value from "./Value";
import Water from "./Water";

require("./atoms.css");

const Atoms = () => {
  let atoms = [
    {
      name: "Id",
      examples: [<Id id="1" />, <Id id="13" />, <Id id="130" />]
    },
    {
      name: "Value",
      examples: [<Value value={20} />, <Value value={100} />]
    },
    {
      name: "Industry",
      examples: [
        <Industry top={1} bottom={20} />,
        <Industry top="ZH" bottom={10} />
      ]
    },
    {
      name: "Company",
      examples: [
        <Company label="A" />,
        <Company label="CdH" radius="7" color="blue" />,
        <Company label="C" left="30" bottom={true} />,
        <Company label="ERR" color="orange" bottom={true} />
      ]
    },
    {
      name: "Icon",
      examples: [<Icon type="meat" />, <Icon type="steam" />, <Icon type="mountain60" />, <Icon type="mountain120" />]
    },
    {
      name: "City",
      examples: [
        [
          <City size={1} border={true} />,
          <City size={1} name={{ name: "Boston" }} />
        ],
        [
          <City size={1} border={true} />,
          <City size={1} name={{ name: "New York", rotation: 90 }} />
        ],
        [
          <City size={1} border={true} />,
          <City
            size={1}
            companies={[{ color: "orange", label: "GT" }]}
            name={{ name: "Toronto", reverse: true }}
          />
        ],
        [<City size={2} border={true} />, <City size={2} />],
        [
          <City size={2} border={true} />,
          <City
            size={2}
            companies={[
              { color: "blue", label: "B&O" },
              { color: "red", label: "PRR" }
            ]}
          />
        ],
        [<City size={3} border={true} />, <City size={3} />],
        [
          <City size={3} border={true} />,
          <City
            size={3}
            companies={[
              { color: "maroon", label: "B&M" },
              { color: "black", label: "NYC" },
              { color: "green", label: "ILC" }
            ]}
          />
        ],
        [<City size={4} border={true} />, <City size={4} />],
        [
          <City size={4} border={true} />,
          <City
            size={4}
            companies={[
              { color: "maroon", label: "B&M" },
              { color: "black", label: "NYC" },
              { color: "cyan", textColor: "black", label: "C&O" },
              { color: "yellow", textColor: "black", label: "Erie" }
            ]}
          />
        ]
      ]
    },
    {
      name: "Town",
      examples: [[<Town border={true} />, <Town />]]
    },
    {
      name: "Center Town",
      examples: [
        [<CenterTown border={true} />, <CenterTown />],
        [
          <CenterTown border={true} />,
          <CenterTown name={{ name: "Austin", reverse: true }} />
        ],
        [
          <CenterTown border={true} />,
          <CenterTown name={{ name: "Boston" }} color="white" />
        ]
      ]
    },
    {
      name: "Label",
      examples: [
        <Label label="B" />,
        <Label label="NY" />,
        <Label label="OO" />
      ]
    },
    {
      name: "Track",
      examples: R.chain(
        type => {
          return R.map(
            gauge => {
              return [
                <Track type={type} gauge={gauge} border={true} />,
                <Track type={type} gauge={gauge} />
              ];
            },
            ["standard", "narrow", "double", "line"]
          );
        },
        [
          "stop",
          "city",
          "mid",
          "straightStop",
          "straightLawson",
          "straight",
          "gentleStop",
          "gentleStopRev",
          "gentle",
          "sharpStop",
          "sharpStopRev",
          "sharp",
          "bent",
          "1860-C"
        ]
      )
    },
    {
      name: "OffBoard Track",
      examples: [[<OffBoardTrack border={true} />, <OffBoardTrack />]]
    },
    {
      name: "OffBoard Revenue",
      examples: [
        <OffBoardRevenue
          revenues={[
            { cost: "20", color: "yellow" },
            { cost: "40", color: "brown" }
          ]}
        />,
        <OffBoardRevenue
          revenues={[
            { cost: "20", color: "yellow" },
            { cost: "30", color: "green" },
            { cost: "40", color: "brown" },
            { cost: "60", color: "gray" }
          ]}
        />
      ]
    },
    {
      name: "Hex",
      examples: [
        [<Hex color="plain" />, <Hex border={true} />],
        [<Hex color="yellow" />, <Hex border={true} />],
        [<Hex color="green" />, <Hex border={true} />],
        [<Hex color="brown" />, <Hex border={true} />],
        [<Hex color="gray" />, <Hex border={true} />],
        [<Hex color="water" />, <Hex border={true} />],
        [<Hex color="offboard" />, <Hex border={true} />]
      ]
    },
    {
      name: "Divide",
      examples: [[<Divide />]]
    },
    {
      name: "Border",
      examples: [
        <Border color="black" />,
        <Border color="water" />,
        <Border color="mountain" />,
        <Border color="red" />,
        <Border color="gray" dashed="true" />,
      ]
    },
    {
      name: "Terrain",
      examples: [
        <Terrain type="cactus" cost="$20" size="tiny" />,
        <Terrain type="cactus" cost="$40" />,
        <Terrain type="cactus" cost="$80" size="medium" />,
        <Terrain type="cactus" cost="$120" size="large" />,
        <Terrain type="mountain" cost="$20" size="tiny" />,
        <Terrain type="mountain" cost="$40" />,
        <Terrain type="mountain" cost="$80" size="medium" />,
        <Terrain type="mountain" cost="$120" size="large" />,
        <Terrain type="stream" cost="$20" size="tiny" />,
        <Terrain type="stream" cost="$40" />,
        <Terrain type="stream" cost="$80" size="medium" />,
        <Terrain type="stream" cost="$120" size="large" />,
        <Terrain type="swamp" cost="$20" size="tiny" />,
        <Terrain type="swamp" cost="$40" />,
        <Terrain type="swamp" cost="$80" size="medium" />,
        <Terrain type="swamp" cost="$120" size="large" />,
        <Terrain type="water" cost="$20" size="tiny" />,
        <Terrain type="water" cost="$40" />,
        <Terrain type="water" cost="$80" size="medium" />,
        <Terrain type="water" cost="$120" size="large" />,
      ]
    },
    {
      name: "Tunnel and Bridge",
      examples: [<Tunnel cost="$40" />,
                 <Bridge cost="$40" />]
    },
    {
      name: "Route Bonus",
      examples: [
        <RouteBonus value="$4" />,
        <RouteBonus value="+30" />,
        <RouteBonus value="+$400" />
      ]
    },
    {
      name: "Clip Paths",
      examples: [
        <use href="#cityPath" fill="none" stroke={colors["purple"]} />,
        <use href="#cityPathReverse" fill="none" stroke={colors["purple"]} />,
        <use href="#city2Path" fill="none" stroke={colors["purple"]} />,
        <use href="#city2PathReverse" fill="none" stroke={colors["purple"]} />,
        <use href="#city3Path" fill="none" stroke={colors["purple"]} />,
        <use href="#city3PathReverse" fill="none" stroke={colors["purple"]} />
      ]
    }
  ];

  let nodes = R.chain(atom => {
    let exampleNodes = R.map(
      example => (
        <dd>
          <Svg width="200" height="200" viewBox="-100 -100 200 200">
            {example}
          </Svg>
        </dd>
      ),
      atom.examples
    );

    return R.concat([<dt>{atom.name}</dt>], exampleNodes);
  }, atoms);

  return (
    <div className="atoms">
      <h1>Atoms</h1>
      <dl>{nodes}</dl>
    </div>
  );
};

export default Atoms;
