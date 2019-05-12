import React from "react";
import * as R from "ramda";

import Svg from "../Svg";
import Hex from "../Hex";

require("../atoms/atoms.scss");

const positions = [{
  group: "X and Y",
  examples: [{centerTowns: [{}]},
             {centerTowns: [{y:35}]},
             {centerTowns: [{x:35}]},
             {centerTowns: [{x:35, y:-35}]}]
},{
  group: "Angle and Percent",
  description: "This allows you to place elements using polar coordinates which is often much nicer when working in hexes.",
  examples: [{centerTowns: [{}]},
             {centerTowns: [{percent: 0.5}]},
             {centerTowns: [{angle: 270, percent: 0.5}]},
             {centerTowns: [{angle: 150, percent: 0.5}]}]
},{
  group: "Rotation",
  examples: [{values: [{value: 10}]},
             {values: [{value: 10, rotate: 45, percent: 0.5}]},
             {values: [{value: 10, rotate: 90, angle: 270, percent: 0.5}]},
             {values: [{value: 10, rotate: 180}]}
            ]
},{
  group: "Sides",
  description: "Side is an alias for rotation multiplied by 60. This is useful when placing hex size objects like track.",
  examples: [{track: [{side: 1}]},
             {track: [{side: 2}]},
             {track: [{side: 3}]},
             {track: [{side: 4}]},
             {track: [{side: 5}]},
             {track: [{side: 6}]},
             {track: [{side: 2.5}]},
            ]
}];

const examples = R.addIndex(R.chain)((h,id) => {
  return <dd key={`example-${id}`}>
           <Svg width="160" height="160" viewBox="-80 -80 160 160">
             <Hex hex={h} id={`${id}`} border={true} />
           </Svg>
           <pre>{JSON.stringify(h, null, 2)}</pre>
         </dd>;
});

const groups = R.addIndex(R.chain)((g,id) => {
  return <dl key={`group-${id}`}>
           <dt>{g.group}</dt>
           {g.description && <p>{g.description}</p>}
           {examples(g.examples)}
         </dl>;
});

const Positioning = () => {
  return (
    <>
      <div className="atoms">
        {groups(positions)}
      </div>
    </>
  );
};

export default Positioning;
