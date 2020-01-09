import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { useParams } from "react-router-dom";
import { unitsToCss, printableWidth, printableHeight } from "./util";
import { GetFont, SetFont } from "./context/FontContext";
import games from "./data/games";
import Color from "./data/Color";

import flatten from "ramda/src/flatten";
import times from "ramda/src/times";

import PageSetup from "./PageSetup";

const radians = degrees => degrees * (Math.PI / 180);
const sin = Math.sin(radians(30));
const cos = Math.cos(radians(30));
const rotatedWidth = (w, h) => Math.abs(w * cos + h * sin);
const rotatedHeight = (w, h) => Math.abs(h * cos + w * sin);

const Background = ({ paper }) => {
  let params = useParams();
  let game = games[params.game];

  let color = game.info.background;
  let title = game.info.title;

  let pageWidth = printableWidth(paper);
  let pageHeight = printableHeight(paper);

  let containerWidth = rotatedWidth(pageWidth, pageHeight);
  let containerHeight = rotatedHeight(pageWidth, pageHeight);

  let text = null;
  let [BB, setBB] = useState({x:0,y:0,width:containerWidth,height:containerHeight});
  useEffect(() => setBB(text.getBBox()), [title, text]);

  let textWidth = BB.width + 12;
  let textHeight = BB.height;

  let cols = Math.ceil(containerWidth / textWidth);
  let rows = Math.ceil(containerHeight / textHeight);

  let textNodes = flatten(times(x => times(y => <text key={`${title}-${x}-${y}`}
                                                    x={x * textWidth} y={y * textHeight}
                                                    fill="#fff" opacity="0.2">{title}</text>, rows), cols));

  return (
    <SetFont context="background">
      <Color context="companies">
        {c => (
          <GetFont>
            {font => (
              <React.Fragment>
                <div className="PrintNotes">
                  <div>
                    <p>Background is meant to be printed in <b>portait</b> mode</p>
                  </div>
                </div>
                <div className="background"
                     style={{ width: unitsToCss(pageWidth),
                              height: unitsToCss(pageHeight),
                              backgroundColor: c(color) }}>
                  <svg viewBox={`0 0 ${pageWidth} ${pageHeight}`}
                       fontFamily={font.fontFamily}
                       fontWeight={font.fontWeight}
                       fontSize="20"
                       style={{ width: unitsToCss(pageWidth),
                                height: unitsToCss(pageHeight) }}>
                    <text style={{visibility: "hidden"}} ref={r => text = r}>{title}</text>
                    <g transform={`translate(${(containerWidth - pageWidth) / -2.0} ${(containerHeight - pageHeight) / -2.0}) rotate(-30 ${containerWidth / 2} ${containerHeight / 2})`}>
                      {textNodes}
                    </g>
                  </svg>
                  {/* <div className="text">{text}</div> */}
                  <PageSetup landscape={false}/>
                </div>
              </React.Fragment>
            )}
          </GetFont>
        )}
      </Color>
    </SetFont>
  );
};

const mapStateToProps = state => ({
  paper: state.config.paper
});

export default connect(mapStateToProps)(Background);
