import React from "react";
import { unitsToCss, addPaginationData } from "../util";
import * as uuid from "uuid";

import Page from "../util/Page";
import PageSetup from "../PageSetup";
import Svg from "../Svg";

import map from "ramda/src/map";

const Paginate = ({component, data, notes, config, game, children}) => {
  // Generate an ID to use for svg content
  const contentId = uuid.v4();

  const defs = (
    <g id={contentId}>
      {children}
    </g>
  );

  let paginationData = addPaginationData(data, config);
  let title = game.info.title;

  let css = `
.cutlines {
    padding: ${paginationData.css.cutlines};
    width: ${unitsToCss(paginationData.xPages[0] + (2.0 * paginationData.cutlinesAndBleed))};
    height: ${unitsToCss(paginationData.yPages[0] + (2.0 * paginationData.cutlinesAndBleed))};
}

.cutlines__page {
    top: -${paginationData.css.cutlines};
    height: ${unitsToCss(Math.min(paginationData.cutlines, 15))};
    font-size: ${unitsToCss(Math.min(paginationData.cutlines, 15))};
}

.cutlines:after,
.cutlines:before {
    width: ${paginationData.css.cutlines};
    height: ${unitsToCss(paginationData.yPages[0] - (2.0 * paginationData.cutlinesOffset))};
    top: ${unitsToCss(paginationData.cutlinesAndBleed + paginationData.cutlinesOffset)};
}

.cutlines > div:after,
.cutlines > div:before {
    width: ${unitsToCss(paginationData.xPages[0] - (2.0 * paginationData.cutlinesOffset))};
    height: ${paginationData.css.cutlines};
    left: ${unitsToCss(paginationData.bleed + paginationData.cutlinesOffset)};
}

.cutlines > div:after {
    bottom: -${paginationData.css.cutlines};
}

.cutlines > div:before {
    top: -${paginationData.css.cutlines};
}
`;

  let currentPage = 0;
  let y = -paginationData.margin;
  let pages = map(height => {
    let x = -paginationData.margin;
    let row = map(width => {
      currentPage++;

      let cssWidth = unitsToCss(width + (2.0 * paginationData.bleed));
      let cssHeight = unitsToCss(height + (2.0 * paginationData.bleed));

      let page = (
        <div
          key={`page-${x}-${y}`}
          className="cutlines"
          style={{
            width: cssWidth,
            height: cssHeight,
            float: "none",
            margin: "auto auto",
            boxSizing: "content-box"
          }}
        >
          <div className="paginated__page">
            <Page title={title} component={component} current={currentPage} total={paginationData.pages} />
            <svg
              style={{
                width: cssWidth,
                height: cssHeight
              }}
              viewBox={`${x - paginationData.bleed} ${y - paginationData.bleed} ${width + (2.0 * paginationData.bleed)} ${height + (2.0 * paginationData.bleed)}`}
            >
              <use href={`#${contentId}`} />
            </svg>
          </div>
        </div>
      );

      x = x + width;
      return page;
    }, paginationData.xPages);

    y = y + height;
    return row;
  }, paginationData.yPages);

  return (
    <>
      <style>{css}</style>
      <Svg className="paginated-svg" defs={defs} />
      {pages}
      <PageSetup landscape={paginationData.landscape} />
    </>
  );
};

export default Paginate;
