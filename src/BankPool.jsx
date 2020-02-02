import React from "react";

import Color from "./data/Color";
import Config from "./data/Config";
import Svg from "./Svg";

import { unitsToCss } from "./util";

import addIndex from "ramda/src/addIndex";
import map from "ramda/src/map";

import "./BankPool.scss";
import Page from "./util/Page";

import PageSetup from "./PageSetup";

import SvgIcon from "./SvgIcon";

const BankPool = () => {
  return (
    <Color>
      {(c,t) => (
        <Config>
          {(config, game) => {
            let { margins, width, height } = config.paper;

            // Bank pools are print in landscape
            let printWidth = height - (2 * margins);
            let printHeight = width - (2 * margins);

            let usableWidth = printWidth - 75;
            let usableHeight = printHeight - 75;

            let poolHeight = usableHeight - 25;
            let poolWidth = usableWidth - 25;

            return (
              <React.Fragment>
                <div className="PrintNotes">
                  <div>
                    <p>Bank Pools are meant to be printed in <b>landscape</b> mode.</p>
                  </div>
                </div>
                {addIndex(map)((pool, i) => (
                  <div
                    key={`pool-${i}`}
                    className="cutlines"
                    style={{
                      width: `${(usableWidth + 25) / 100}in`,
                      height: `${(usableHeight + 25) / 100}in`,
                      float: "none",
                      margin: "auto auto",
                      boxSizing: "content-box"
                    }}
                  >
                    <div className="bankpool">
                      <Page title={game.info.title} component="Bank Pool" current={i+1} total={game.pools.length} />
                      <Svg
                        width={unitsToCss(usableWidth)}
                        height={unitsToCss(usableHeight)}
                        viewBox={`0 0 ${poolWidth} ${poolHeight}`}>
                        <rect x="0" y="50"
                              width={poolWidth} height={poolHeight - 50}
                              stroke="black"
                              fill="white" />
                        <text
                          fontFamily="display"
                          fontStyle="bold"
                          fontSize="25"
                          dominantBaseline="hanging"
                          x="0"
                          y="12.5"
                        >
                          {game.info.title} {pool.name}
                        </text>
                        {addIndex(map)((note, j) => (
                          <g key={`pool-${i}-note-${j}`}>
                            <circle r="15" cx="30" cy={poolHeight + 15 - ((j + 1) * 45)}
                                    stroke="none"
                                    fill={c(note.color || "orange")} />
                            <SvgIcon name={note.icon || "info"}
                                     style={{fill: t(c(note.color || "orange"))}}
                                     x={15}
                                     y={poolHeight - ((j + 1) * 45)} />
                            <text
                              fontFamily="sans-serif"
                              fontSize="14"
                              fontWeight="normal"
                              textAnchor="start"
                              dominantBaseline="middle"
                              fill="black"
                              stroke="black"
                              x="54"
                              y={poolHeight + 15 - ((j+1) * 45)}
                            >
                              {note.note}
                            </text>
                          </g>
                        ), pool.notes)}
                      </Svg>
                      <PageSetup landscape={true} />
                    </div>
                  </div>
                ), game.pools)}
              </React.Fragment>
            );
          }}
        </Config>
      )}
    </Color>
  );
};

export default BankPool;
