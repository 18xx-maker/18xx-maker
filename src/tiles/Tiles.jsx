import React, { useState } from "react";
import { Link } from "react-router-dom";
import * as R from "ramda";

import any from "ramda/src/any";
import filter from "ramda/src/filter";

import Tile from "../Tile";

import Svg from "../Svg";
import ColorContext from "../context/ColorContext";

const Tiles = ({color}) => {
  let [tileFilter, setTileFilter] = useState("");

  let ids = R.sortWith(
    [
      R.ascend(id => Number(id.split("|")[0] || 0)),
      R.ascend(id => Number(id.split("|")[1] || 0))
    ],
    R.keys(filter(t => {
      if (!t || tileFilter === "") {
        return true;
      }

      return t.color.includes(tileFilter.toLowerCase()) ||
        t.id.toLowerCase().includes(tileFilter.toLowerCase()) ||
        any(label => label.label.toLowerCase().includes(tileFilter.toLowerCase()), t.labels || []);
    }, tiles))
  );

  let tileNodes = R.map(id => {
    return (
      <Link to={`/tile/${id}`}>
        <Svg key={id}
             width="200"
             height="200"
             viewBox="-100 -100 200 200"
             transform="rotate(-90)">
          <Tile id={id} width={150} x={0} y={0} />
        </Svg>
      </Link>
    );
  }, ids);

  let handleChange = event => {
    setTileFilter(event.target.value);
  };

  return (
    <ColorContext.Provider value="tile">
      <div className="tiles">
        <h3>All Tiles</h3>
        <label>
          Filter: <input type="text" value={tileFilter} onChange={handleChange}/>
        </label>
        {tileNodes}
      </div>
    </ColorContext.Provider>
  );
};

export default Tiles;
