import React from "react";
import { connect } from "react-redux";

import { unitsToCss } from "./util";

import is from "ramda/src/is";

export const paperToCssSize = (paper, landscape) => {
  let width = unitsToCss(landscape ? paper.height : paper.width);
  let height = unitsToCss(landscape ? paper.width : paper.height);
  return `size: ${width} ${height};`;
};

export const paperToCssMargins = (paper, landscape) => {
  let margins = paper.margins;

  // Simple number case
  if (is(Number, margins)) {
    return `margin: ${unitsToCss(margins)};`;
  }

  let top = unitsToCss(landscape ? margins.right : margins.top);
  let right = unitsToCss(landscape ? margins.bottom : margins.right);
  let bottom = unitsToCss(landscape ? margins.left : margins.bottom);
  let left = unitsToCss(landscape ? margins.top : margins.left);

  return `margin: ${top} ${right} ${bottom} ${left};`;
};

const PageSetup = ({paper, landscape}) => {
  let css = `@media print {
    @page {
        ${paperToCssSize(paper, landscape)}
        ${paperToCssMargins(paper, landscape)}
    }
}`;

  return <style>{css}</style>;
};

const mapStateToProps = (state, {paper}) => ({
  paper: paper || state.config.paper
});

export default connect(mapStateToProps)(PageSetup);
