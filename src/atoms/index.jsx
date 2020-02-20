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
             {color: "grey"},
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
             {values: [{value: 60, shape: "square"}]},
             {values: [{
               outerBorderColor: "green",
               value: 120
             }]},
             {values: [{
               outerBorderColor: "green",
               shape: "square",
               value: 120
             }]},
             {values: [{value: 1024}]},
             {values: [{value: "60/60"}]},
             {values: [{value: "Longer"}]}
            ]
},{
  group: "Names",
  examples: [{names: [{name:"Boston"}]},
             {names: [{name: "Austin", percent: 0.6, angle: 240}]},
             {names: [{name: "Seattle", percent: 0.6, rotate: -60, angle: 120}]},
             {names: [{name: "Los Angeles",
                       fontFamily: "display", fontSize: 20,
                       color: "yellow", strokeWidth: 1}]},
             {names: [{name: "Paris", fontFamily: "Elegante", fontSize: 16, fontWeight: "normal", fontStyle: "italic"}]}],
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
             {icons: [{type: "port"}]},
             {icons: [{type: "fish"}]},
             {icons: [{type: "tunnel"}]},
             {icons: [{type: "token"}]},
             {icons: [{type: "cylinder"}]},
             {icons: [{type: "tree"}]},
             {icons: [{type: "home"}]},
             {icons: [{type: "mail"}]},
             {icons: [{type: "boat"}]},
             {icons: [{type: "tracks"}]},
             {icons: [{type: "train"}]},
             {icons: [{type: "share"}]},
             {icons: [{type: "share", color: "orange"}]},
             {icons: [{type: "charter"}]},
             {icons: [{type: "bridge"}]},
             {icons: [{type: "swamp"}]},
             {icons: [{type: "cactus"}]},
             {icons: [{type: "water"}]},
             {icons: [{type: "river"}]},
             {icons: [{type: "mountain"}]},
             {icons: [{type: "medium-city"}]}]
},{
  group: "Tokens",
  examples: [
    {tokens: [{label:"AA", color:"orange"}]},
    {tokens: [{label:"AA2", bar:true, color:"orange"}]},
    {tokens: [{label:"AA3", bar:true, barHeight:30, color:"orange"}]},
    {tokens: [{label:"BB", color:"orange", "square": "blue"}]},
    {tokens: [{label:"BB2", color:"orange", "square": "blue", angle: 45}]},
    {tokens: [{label:"CC", bar: true, quarters: ["blue", "orange", "orange", "blue"]}]},
    {tokens: [{label:"CC2", angle: 120, bar: true, quarters: ["blue", "orange", "orange", "blue"]}]},
    {tokens: [{label:"DD", halves: ["blue", "orange"], bar: true}]},
    {tokens: [{label:"EE", bar: true, color: "blue", stripes: "orange"}]},
    {tokens: [{label:"EE2", stripesWidth: 10, stripesDistance: 6, angle: -15, color: "blue", stripes: "orange"}]},
    {tokens: [{label:"FF", color: "orange", bar: "blue"}]},
    {tokens: [{label:"GG", bar: true, stripe: "orange", color: "blue"}]},
    {tokens: [{label:"GG2", bar: true, stripe: "orange", color: "blue", angle: 45}]},
    {tokens: [{label:"HH", target: "orange", color: "blue", bar: true}]},
    {tokens: [{label:"II", target: "orange", halves: ["purple", "blue"], bar: true}]},
    {tokens: [{label:"JJ", bar: true, color: "blue", curvedStripes: "orange"}]},
    {tokens: [{label:"JJ2", curvedStripesWidth: 12, curvedStripesDistance: 16, angle: -15, color: "blue", curvedStripes: "orange"}]},
    {tokens: [{label:"KK", bar:true, curvedStripes: "black", curvedStripesDistance: 19, stripe: "black", stripeWidth: "6.25", color: "orange"}]},
    {tokens: [{label:"LL", spiral: "orange", "color": "blue"}]},
    {tokens: [{label:"LL2", spiralWidth: 2, spiralDistance: 4, spiral: "orange", "color": "blue"}]},
    {tokens: [{label:"MM", circle: true, "color": "blue"}]},
    {tokens: [{label:"MM2", circleRadius: 20, circle: "orange", "color": "blue"}]},
    {tokens: [{label:"KO", color: "purple"}]},
    {tokens: [{company:"CPR"}]},
    {tokens: [{company:"PRR", destination: true}]},
    {tokens: [{company:"C&O", reserved: true}]},
    {tokens: [{logo:"dev/emacs"}]},
    {tokens: [{icon:"coal"}]},
    {tokens: [{icon:"port", iconColor:"red"}]},
    {tokens: [{icon:"mail"}]},
    {tokens: [{icon:"mail", iconColor:"orange"}]},
    {tokens: [{icon:"tracks", label: "$100"}]},
    {tokens: [{icon:"boat", iconColor:"red", label: "Free"}]}
  ]
},{
  group: "Cities",
  examples: [{cities: [{}]},
             {cities: [{name:{offset: 75, name: "Boston"}}]},
             {cities: [{companies:["NYNH"],
                        name:{reverse:true, name: "New York"}}]},
             {cities: [{size:2,
                        companies: [{},"B&O"],
                        name: {name: "Baltimore"}
                       }]},
             {cities: [{size:3,
                        companies: ["NYC"]
                       }]},
             {cities: [{size:4,
                        icons: ["mail", null, null, "boat"],
                        companies: [null,
                                    "B&M",
                                    { abbrev:"PRR", reserved: true }]
                       }]},
             {cities: [{size:5,
                        icons: [null, "share", null, "charter"],
                        companies: ["C&O", null, "B&M", null, "NYC"]}]},
             {cities: [{size:6,
                        icons: [null, "water", null, "port", null, "train"],
                        companies: ["C&O", null, "B&M", null, "NYC"]}]},
             {cities: [{size:1,
                        pass:true
                       }]},
             {cities: [{size:2,
                        pass:true
                       }]},
             {cities: [{size:3,
                        icons: ["meat", null, "share"]
                       }]}
            ]
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
    {track: [{side:4,type:"straightStop",gauge:"line"},
             {side:5,type:"straight",gauge:"dashed"}]},
    {track: [{side:1,type:"lawson"}]},
    {track: [{side:2,type:"stub"},
             {side:3,type:"stop"},
             {side:4.5,type:"mid"}]},
    {track: [{side:1,type:"bent"}]},
    {track: [{path:"m 0 85 L 0 50 C 75 0, -75 0, 0 -50 L 0 -85", type:"custom"}]},
    {track: [{side:1,type:"offboard"},{side:6,type:"offboard"}]},
    {track: [{side:1,type:"gentle",cross:"under",color:"water"},
             {side:2,type:"gentle",cross:"over",color:"mountain"}]},
    {track: [{side:3,type:"gentle",gauge:"narrow",color:"mountain",borderColor:"black",gaugeColor:"yellow"},
             {side:4,type:"gentle",gauge:"double",color:"water",borderColor:"black",gaugeColor:"green"}]}
  ]
},{
  group: "Offboard Revenues",
  examples: [{
    offBoardRevenue: {
      name: {name: "Boston"},
      revenues: [{
        color: "yellow",
        cost: 20
      },{
        color: "brown",
        cost: 40
      }]
    }
  },{
    color: "offboard",
    offBoardRevenue: {
      reverse: true,
      name: {name: "Boston"},
      revenues: [{
        color: "yellow",
        cost: 20,
        phase: 2
      },{
        color: "brown",
        cost: 40,
        phase: 5,
        phaseColor: "brown"
      }]
    }
  },{
    offBoardRevenue: {
      name: {name: "Boston"},
      reverse: true,
      rows: 2,
      revenues: [{
        color: "yellow",
        cost: 20
      },{
        color: "green",
        cost: 30
      },{
        color: "brown",
        cost: 40
      },{
        color: "gray",
        cost: 120
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
    {terrain: [{size:"medium",cost:60}]},
    {terrain: [{type:"mountain",cost:100}]},
    {terrain: [{type:"water",cost:40}]},
    {terrain: [{type:"river",cost:20}]},
    {terrain: [{type:"cactus",cost:20}]},
    {terrain: [{type:"tree",cost:20,color:"green"}]},
    {terrain: [{size:"tiny",type:"river",cost:10}]},
    {terrain: [{size:"large",type:"swamp",cost:120}]}
  ]
},{
  group: "Tunnels and Bridges",
  examples: [
    {tunnels: [{cost:40}]},
    {bridges: [{cost:40}]},
    {tunnelEntrances: [{percent:1}]},
    {tunnelEntrances: [{angle:120,percent:1,rotation:-60,color:"red"},
                       {angle:180,percent:1,color:"orange"},
                       {angle:240,percent:1,rotation:60,color:"yellow"}
                      ]}]
},{
  group: "Route Bonuses",
  examples: [
    {routeBonus: [{value:"$40"}]},
    {routeBonus: [{value:"+$120",fillColor:"black",strokeColor:"red",textColor:"white"}]}]
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
