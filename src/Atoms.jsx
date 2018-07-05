import React from "react";
import * as R from "ramda";
import css from "./atoms.css";

import Id from "./atoms/Id";
import Value from "./atoms/Value";
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
      name: "City",
      examples: [
        <City size={1} />,
        <City size={1} border={true} />,
        <City size={2} />,
        <City size={2} border={true} />,
        <City size={3} />,
        <City size={3} border={true} />,
        <City size={4} />,
        <City size={4} border={true} />
      ]
    },
    {
      name: "Town",
      examples: [<Town />, <Town border={true} />]
    },
    {
      name: "Center Town",
      examples: [<CenterTown />, <CenterTown border={true} />]
    },
    {
      name: "Label",
      examples: [
        <Label label="B" />,
        <Label label="NY" />,
        <Label label="OO" />,
        <Label label="New York" />
      ]
    },
    {
      name: "Track",
      examples: [
        <Track type="city" />,
        <Track type="city" gauge="narrow" />,
        <Track type="city" gauge="double" />,
        <Track type="city" border={true} />,
        <Track type="stop" />,
        <Track type="stop" gauge="narrow" />,
        <Track type="stop" gauge="double" />,
        <Track type="stop" border={true} />,
        <Track type="straight" />,
        <Track type="straight" gauge="narrow" />,
        <Track type="straight" gauge="double" />,
        <Track type="straight" border={true} />,
        <Track type="gentle" />,
        <Track type="gentle" gauge="narrow" />,
        <Track type="gentle" gauge="double" />,
        <Track type="gentle" border={true} />,
        <Track type="sharp" />,
        <Track type="sharp" gauge="narrow" />,
        <Track type="sharp" gauge="double" />,
        <Track type="sharp" border={true} />,
        <Track type="bent" />,
        <Track type="bent" gauge="narrow" />,
        <Track type="bent" gauge="double" />,
        <Track type="bent" border={true} />
      ]
    },
    {
      name: "Hex",
      examples: [
        <Hex border={true} />,
        <Hex color="plain" />,
        <Hex color="yellow" />,
        <Hex color="green" />,
        <Hex color="brown" />,
        <Hex color="gray" />,
        <Hex color="water" />,
        <Hex color="offboard" />
      ]
    },
        {
          name: "Border",
          examples: [
              <Border color="black" />,
              <Border color="water" />,
            <Border color="mountain" />
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
      examples: [<OffBoardTrack />, <OffBoardTrack border={true} />]
    }
  ];

  let nodes = R.chain(atom => {
    let exampleNodes = R.map(
      example => (
        <dd>
          <svg width="200" height="200" viewBox="-100 -100 200 200">
            {example}
          </svg>
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
