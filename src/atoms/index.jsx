import React from "react";
import * as R from "ramda";

import { colors } from "../data";

import Svg from "../Svg";

import Id from "./Id";
import Value from "./Value";
import Industry from "./Industry";
import Company from "./Company";
import Icon from "./Icon";
import City from "./City";
import Town from "./Town";
import CenterTown from "./CenterTown";
import Label from "./Label";
import Track from "./Track";
import OffBoardTrack from "./OffBoardTrack";
import OffBoardRevenue from "./OffBoardRevenue";
import Hex from "./Hex";
import Divide from "./Divide";
import Border from "./Border";
import Mountain from "./Mountain";
import Tunnel from "./Tunnel";
import Water from "./Water";
import Bridge from "./Bridge";
import RouteBonus from "./RouteBonus";

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
        <Company label="CdH" radius="7" color="purple" />,
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
      name: "Mountain",
      examples: [
        <Mountain size="tiny" cost="$20" />,
        <Mountain size="small" cost="$40" />,
        <Mountain size="medium" cost="$80" />,
        <Mountain size="large" cost="$120" />,
        <Mountain border={true} size="tiny" cost="$20" />,
        <Mountain border={true} size="small" cost="$40" />,
        <Mountain border={true} size="medium" cost="$80" />,
        <Mountain border={true} size="large" cost="$120" />
      ]
    },
    {
      name: "Tunnel",
      examples: [<Tunnel cost="$40" />]
    },
    {
      name: "Water",
      examples: [
        <Water size="tiny" cost="$20" />,
        <Water size="small" cost="$40" />,
        <Water size="medium" cost="$80" />,
        <Water size="large" cost="$120" />,
        <Water border={true} size="tiny" cost="$20" />,
        <Water border={true} size="small" cost="$40" />,
        <Water border={true} size="medium" cost="$80" />,
        <Water border={true} size="large" cost="$120" />
      ]
    },
    {
      name: "Bridge",
      examples: [<Bridge cost="$40" />]
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
        <use href="#townPath" fill="none" stroke={colors["purple"]} />,
        <use href="#townPathReverse" fill="none" stroke={colors["purple"]} />,
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
