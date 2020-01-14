import React, { useState } from "react";
import { Redirect, useParams } from "react-router-dom";

import { connect } from "react-redux";
import Market from "./Market";
import games from "./data/games";

import Rounds from "./Rounds";
import Par from "./Par";
import Legend from "./Legend";

import GameContext from "./context/GameContext";
import { SetFont } from "./context/FontContext";
import "./Stock.css";
import { height, width } from "./market-utils";
import { paperToCssMargins } from "./PageSetup";

const Stock = ({cell, paper}) => {
  let params = useParams();
  let [displayMode, setDisplayMode] = useState("normal");
  let handleDisplayMode = event => setDisplayMode(event.target.value);

  let game = games[params.game];

  if (!game.stock) {
    return <Redirect to={`/${params.game}/background`} />;
  }

  let stock = game.stock;

  let rows = height(stock.market);
  let cols = width(stock.market);
  let pageHeight = ((rows * (1 + cell.height)) / 100.0) + 1.0;
  let pageWidth = ((cols * (1 + cell.width)) / 100.0) + 0.5;

  let css = `@media print {
    @page {
        size: ${pageWidth}in ${pageHeight}in;
        ${paperToCssMargins(paper, pageHeight < pageWidth)}
    }
}`;

  return (
    <GameContext.Provider value={params.game}>
      <SetFont context="stock">
        <div className="PrintNotes">
          <div>
            <p>
              Stock Market is meant to be printed in{" "}
              <b>{stock.orientation || "landscape"}</b> mode
            </p>
          </div>
          {false &&
           stock.type === "2D" && (
             <React.Fragment>
               <br />
               <br />
               <label>
                 <select
                   name="displayMode"
                   value={displayMode}
                   onChange={handleDisplayMode}
                 >
                   <option value="normal">Normal</option>
                   <option value="delta">%Δ</option>
                 </select>
               </label>
             </React.Fragment>
           )}
        </div>
        <div className="stock">
          <Market
            {...stock}
            paginated={false}
            title={game.info.title}
            displayMode={displayMode}
          />
          <div className="StockHelpers">
            {stock.par &&
             stock.par.values && (
               <Par par={stock.par} legend={stock.legend || []} />
             )}
            <Legend
              legend={game.stock.legend || []}
              movement={game.stock.movement}
              horizontal={game.stock.type === "2D" ? false : true}
            />
          </div>
          <style>{css}</style>
        </div>
      </SetFont>
    </GameContext.Provider>
  );
};

const mapStateToProps = state => ({
  cell: state.config.stock.cell,
  paper: state.config.paper
});

export default connect(mapStateToProps)(Stock);
