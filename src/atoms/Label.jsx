import React from "react";

import Text from "./shapes/Text";

const Label = (props, rotation, fontSize) => {
  let { label } = props;

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
          <Text
                fontSize={fontSize}
                {...props}
                text={label}/>
  );
};

export default Label;
