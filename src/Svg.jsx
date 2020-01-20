import React from "react";
import Color from "./data/Color";

const Svg = ({ className, width, height, viewBox, style, defs, children }) => {
  const namespaces = {
    "xmlns": "http://www.w3.org/2000/svg",
    "xmlns:xhtml": "http://www.w3.org/1999/xhtml"
  };

  return (
    <Color>
      {c => (
        <svg
          version="1.1"
          width={width}
          height={height}
          viewBox={viewBox}
          style={style}
          className={className}
          {...namespaces}
        >
          <defs>
            {defs}
          </defs>
          {children}
        </svg>
      )}
    </Color>
  );
};

export default Svg;
