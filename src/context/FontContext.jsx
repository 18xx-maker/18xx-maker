import React, { useContext } from "react";
import ConfigContext from "./ConfigContext";

import { append } from "ramda";

import { resolveFont } from "../util/font";

const FontContext = React.createContext([]);

// Takes in a new font string, and will add it to current context
export const SetFont = ({ context, children }) => (
  <FontContext.Consumer>
    {(prev) => {
      return (
        <FontContext.Provider value={append(context, prev)}>
          {children}
        </FontContext.Provider>
      );
    }}
  </FontContext.Consumer>
);

export const GetFont = ({ children }) => {
  const { config } = useContext(ConfigContext);

  return (
    <FontContext.Consumer>
      {(context) => children(resolveFont(context, config.fonts))}
    </FontContext.Consumer>
  );
};

export default FontContext;
