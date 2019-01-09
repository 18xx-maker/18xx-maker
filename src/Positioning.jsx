import React from "react";
import * as R from "ramda";

import Svg from "./Svg";
import Hex from "./Hex";

require("./atoms/atoms.css");

const positions = [{
  group: "X and Y",
  examples: [{centerTowns: [{}]},
             {centerTowns: [{y:35}]},
             {centerTowns: [{x:35}]},
             {centerTowns: [{x:35, y:-35}]}]
},{
  group: "Angle and Percent",
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
           {examples(g.examples)}
         </dl>;
});

const Positioning = () => {
  return (
    <div className="atoms">
      <h1>Positioning</h1>
      {groups(positions)}
    </div>
  );
};

export default Positioning;
