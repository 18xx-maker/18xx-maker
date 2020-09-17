import React from "react";

import Text from "./shapes/Text";

import RotateContext from "../context/RotateContext";

const Label = (props, rotation, fontSize) => {
  let { label, fixed } = props;

  if (!fontSize) {
    fontSize = label.length > 2 ? 20 : 30;
    if (label.length > 8) {
      fontSize = 18;
    }
    if (label.length > 12) {
      fontSize = 16;
    }
    if (label.length > 16) {
      fontSize = 12;
    }
  }

  return (
    <RotateContext.Consumer>
      {rotateContext => (
        <g transform={(fixed || rotateContext.fixed) ? null : `rotate(15-${rotateContext.angle - (rotation || 0)})`}>
          <Text
                fontSize={fontSize}
                {...props}
                text={label}/>
        </g>
      )}
    </RotateContext.Consumer>
  );
};

export default Label;
