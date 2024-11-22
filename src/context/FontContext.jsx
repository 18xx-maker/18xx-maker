import { createContext } from "react";

import { append } from "ramda";

import { useConfig } from "@/hooks";
import { resolveFont } from "@/util/font";

const FontContext = createContext([]);

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
  const { config } = useConfig();

  return (
    <FontContext.Consumer>
      {(context) => children(resolveFont(context, config.fonts))}
    </FontContext.Consumer>
  );
};

export default FontContext;
