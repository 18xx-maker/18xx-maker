import React from "react";
import * as R from "ramda";

import Svg from "../Svg";
import Hex from "../Hex";

import ColorContext from "../context/ColorContext";

require("./atoms.scss");

const atoms = [{
  group: "Hexes",
  examples: [{color: "plain"},
             {color: "offboard"},
             {color: "mountain"},
             {color: "water"},
             {color: "land", divides: [{side:3}]},
             {color: "yellow"},
             {color: "green"},
             {color: "brown"},
             {color: "gray"},
             {color: "orange", divides: [{side:2}]},
             {color: "yellow/green"},
             {color: "green/brown"},
             {color: "brown/gray"},
             {color: "mountain", removeBorders: [1,4]},
             {color: "water", removeBorders: [1,3,5]}
            ]
},{
  group: "Values",
  examples: [{values: [{value: 20}]},
             {values: [{value: 60}]},
             {values: [{
              "outerBorderColor": "green",
              "value": 120
             }]}
            ]
},{
  group: "Names",
  examples: [{names: [{name:"Boston"}]},
             {names: [{name: "Austin", percent: 0.6, angle: 240}]},
             {names: [{name: "Seattle", percent: 0.6, rotate: -60, angle: 120}]}]
},{
  group: "Industries",
  examples: [{industries: [{top:1,bottom:20}]},
             {industries: [{top:"ZH",bottom:10}]}]
},{
  group: "Goods",
  examples: [{goods: [{}]},
             {goods: [{color: "purple"}]},
             {goods: [{color: "orange"}]}]
},{
  group: "Private Companies",
  examples: [{companies: [{label:"A"}]},
             {companies: [{label: "CdH", left: 50, right: 50, color: "blue"}]},
             {companies: [{label: "C", left: 30, bottom: true}]},
             {companies: [{label: "ERR", color: "orange", radius: 8, bottom: true}]}]
},{
  group: "Icons",
  examples: [{icons: [{type: "meat"}]},
             {icons: [{type: "coal"}]},
             {icons: [{type: "steam"}]}]
},{
  group: "Tokens",
  examples: [
    {tokens: [{label:"AA", token:"orange"}]},
    {tokens: [{label:"BB", token:{type:"square", colors:["blue", "orange"]}}]},
    {tokens: [{label:"CC", token:{type:"quarters", colors:["blue", "orange"]}}]},
    {tokens: [{label:"DD", token:{type:"halves", colors:["blue", "orange"]}}]},
    {tokens: [{label:"EE", token:{type:"stripes", colors:["blue", "orange"]}}]},
    {tokens: [{label:"FF", token:{type:"bar", colors:["blue", "orange"]}}]},
    {tokens: [{label:"GG", token:{type:"stripe", colors:["blue", "orange"]}}]},
    {tokens: [{label:"HH", token:{type:"target", colors:["blue", "orange"]}}]},
    {tokens: [{label:"Longer", token:"blue"}]},
    {tokens: [{label:"KO", token:"purple"}]}
  ]
},{
  group: "Cities",
  examples: [{cities: [{}]},
             {cities: [{name:{offset: 75, name: "Boston"}}]},
             {cities: [{companies:[{label:"GT",color:"orange"}],
                        name:{reverse:true, name: "Boston"}}]},
             {cities: [{size:2,
                        companies: [{},{label:"B&O",color:"blue"}],
                        name: {name: "Baltimore"}
                       }]},
             {cities: [{size:3,
                        companies: [{label:"NYC",color:"black"}]
                       }]},
             {cities: [{size:4,
                        companies: [{},
                                    {label:"BM",color:"brown"},
                                    {label:"PRR",color:"green"}]
                       }]
             }]
},{
  group: "Towns",
  examples: [{towns: [{}]},
             {towns: [{name:{name:"Austin"}}]},
             {towns: [{name:{name:"Boston", reverse: true}}]}]
},{
  group: "Center Towns",
  examples: [{centerTowns: [{}]},
             {centerTowns: [{color:"orange",name:{name:"Austin"}}]},
             {centerTowns: [{name:{name:"Boston", reverse: true}}]}]
},{
  group: "Medium Cities",
  examples: [{mediumCities: [{}]},
             {mediumCities: [{color:"orange",name:{name:"Austin"}}]},
             {mediumCities: [{name:{name:"Boston", reverse: true}}]}]
},{
  group: "Labels",
  examples: [
    {labels: [{label:"B"}]},
    {labels: [{label:"NY"}]},
    {labels: [{label:"OO"}]}
  ]
},{
  group: "Track",
  examples: [
    {track: [{side:1,type:"straight"}]},
    {track: [{side:3,type:"gentle",gauge:"narrow"}]},
    {track: [{side:5,type:"gentleStop"},
             {side:5,type:"gentleStopRev"}]},
    {track: [{side:1,type:"sharp",gauge:"double"},
             {side:3,type:"sharpStop"},
             {side:5,type:"sharpStopRev"}]},
    {track: [{side:1,type:"straight",cross:"under"},
             {side:3,type:"gentle",cross:"over"}]},
    {track: [{side:4,type:"straightStop",gauge:"line"}]},
    {track: [{side:1,type:"lawson"}]},
    {track: [{side:2,type:"stub"},
             {side:3,type:"stop"},
             {side:4.5,type:"mid"}]},
    {track: [{side:1,type:"bent"}]},
    {track: [{path:"m 0 85 L 0 50 C 75 0, -75 0, 0 -50 L 0 -85", type:"custom"}]},
    {track: [{side:1,type:"offboard"},{side:6,type:"offboard"}]}
  ]
},{
  group: "Offboard Revenues",
  examples: [{
    offBoardRevenue: {
      name: {name: "Boston"},
      revenues: [{
        color: "yellow",
        cost: "20"
      },{
        color: "brown",
        cost: "40"
      }]
    }
  },{
    color: "offboard",
    offBoardRevenue: {
      reverse: true,
      name: {name: "Boston"},
      revenues: [{
        color: "yellow",
        cost: "20",
        phase: 2
      },{
        color: "brown",
        cost: "40",
        phase: 5
      }]
    }
  },{
    offBoardRevenue: {
      name: {name: "Boston"},
      reverse: true,
      rows: 2,
      revenues: [{
        color: "yellow",
        cost: "20"
      },{
        color: "green",
        cost: "30"
      },{
        color: "brown",
        cost: "40"
      },{
        color: "gray",
        cost: "120"
      }]
    }
  }]
},{
  group: "Borders",
  examples: [
    {borders: [{side:1,color:"offboard"}]},
    {borders: [{side:1,color:"water"},{side:2,color:"water"}]},
    {borders: [{side:4,color:"mountain",dashed:true},
               {side:5,color:"mountain",dashed:true},
               {side:6,color:"mountain",dashed:true}]},
  ]
},{
  group: "Terrain",
  examples: [
    {terrain: [{}]},
    {terrain: [{size:"medium",cost:"$60"}]},
    {terrain: [{type:"water",cost:"$40"}]},
    {terrain: [{type:"stream",cost:"$20"}]},
    {terrain: [{size:"tiny",type:"river",cost:"$10"}]},
    {terrain: [{type:"cactus",cost:"$20"}]},
    {terrain: [{size:"large",type:"swamp",cost:"$120"}]}
  ]
},{
  group: "Tunnels and Bridges",
  examples: [
    {tunnels: [{cost:"$40"}]},
    {bridges: [{cost:"$40"}]}]
},{
  group: "Route Bonuses",
  examples: [
    {routeBonus: [{value:"$40"}]},
    {routeBonus: [{value:"+$120"}]}]
}];

const examples = R.addIndex(R.chain)((h,id) => {
  return <dd key={`example-${id}`}>
           <Svg width="175.205" height="152" viewBox="-87.6025 -76 175.205 152">
             <Hex hex={h} id={`${id}`} border={true} bleed={true} />
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

const Atoms = () => {
  return (
    <ColorContext.Provider value="companies">
      <div className="atoms">
        {groups(atoms)}
      </div>
    </ColorContext.Provider>
  );
};

export default Atoms;
