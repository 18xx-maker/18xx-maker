import React from "react";

import { Route, Routes } from "react-router-dom";

import TileNav from "../nav/Tiles";
import Tiles from "./Tiles";
import Atoms from "../atoms";
import Positioning from "./Positioning";

const TilesIndex = () => {
  return (
    <>
      <div className="PrintNotes">
        <div>
          <TileNav/>
        </div>
      </div>
      <Routes>
        <Route path="/tiles" element={<Tiles />}/>
        <Route path="/tiles/atoms" element={<Atoms />}/>
        <Route path="/tiles/positioning" element={<Positioning />}/>
      </Routes>
    </>
  );
};

export default TilesIndex;
