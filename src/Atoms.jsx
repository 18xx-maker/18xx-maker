import React from "react";
import * as R from "ramda";
import css from "./atoms.css";

import Svg from "./Svg";

import Id from "./atoms/Id";
import Value from "./atoms/Value";
import Icon from "./atoms/Icon";
import City from "./atoms/City";
import Town from "./atoms/Town";
import CenterTown from "./atoms/CenterTown";
import Label from "./atoms/Label";
import Track from "./atoms/Track";
import Hex from "./atoms/Hex";
import Border from "./atoms/Border";
import Mountain from "./atoms/Mountain";
import Water from "./atoms/Water";
import OffBoardRevenue from "./atoms/OffBoardRevenue";
import OffBoardTrack from "./atoms/OffBoardTrack";

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
      name: "Icon",
      examples: [<Icon type="meat" />, <Icon type="steam" />]
    },
    {
      name: "City",
      examples: [
        [<City size={1} border={true} />, <City size={1} name="Boston" />],
        [<City size={1} border={true} />, <City size={1} name="New York" nameRotation="90" />],
        [
          <City size={1} border={true} />,
          <City size={1} companies={[{ color: "orange", label: "GT" }]} name="Toronto" nameReverse={true} />
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
      examples: [[<CenterTown border={true} />, <CenterTown />]]
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
      examples: [
        [<Track type="city" border={true} />, <Track type="city" />],
        [
          <Track type="city" border={true} />,
          <Track type="city" gauge="narrow" />
        ],
        [
          <Track type="city" border={true} />,
          <Track type="city" gauge="double" />
        ],
        [<Track type="stop" border={true} />, <Track type="stop" />],
        [
          <Track type="stop" border={true} />,
          <Track type="stop" gauge="narrow" />
        ],
        [
          <Track type="stop" border={true} />,
          <Track type="stop" gauge="double" />
        ],
        [<Track type="straight" border={true} />, <Track type="straight" />],
        [
          <Track type="straight" border={true} />,
          <Track type="straight" gauge="narrow" />
        ],
        [
          <Track type="straight" border={true} />,
          <Track type="straight" gauge="double" />
        ],
        [<Track type="gentle" border={true} />, <Track type="gentle" />],
        [
          <Track type="gentle" border={true} />,
          <Track type="gentle" gauge="narrow" />
        ],
        [
          <Track type="gentle" border={true} />,
          <Track type="gentle" gauge="double" />
        ],
        [<Track type="sharp" border={true} />, <Track type="sharp" />],
        [
          <Track type="sharp" border={true} />,
          <Track type="sharp" gauge="narrow" />
        ],
        [
          <Track type="sharp" border={true} />,
          <Track type="sharp" gauge="double" />
        ],
        [<Track type="bent" border={true} />, <Track type="bent" />],
        [
          <Track type="bent" border={true} />,
          <Track type="bent" gauge="narrow" />
        ],
        [
          <Track type="bent" border={true} />,
          <Track type="bent" gauge="double" />
        ]
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
      name: "Border",
      examples: [
        [<Border border={true} />, <Border color="black" />],
        [<Border border={true} />, <Border color="water" />],
        [<Border border={true} />, <Border color="mountain" />]
      ]
    },
    {
      name: "Mountain",
      examples: [
        <Mountain size="small" cost="$40" />,
        <Mountain size="medium" cost="$80" />,
        <Mountain size="large" cost="$120" />
      ]
    },
    {
      name: "Water",
      examples: [
        <Water size="small" cost="$40" />,
        <Water size="medium" cost="$80" />,
        <Water size="large" cost="$120" />
      ]
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
      name: "OffBoard Track",
      examples: [[<OffBoardTrack border={true} />, <OffBoardTrack />]]
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
      <dl>{nodes}</dl>
    </div>
  );
};

export default Atoms;
