import { createContext } from "react";

// A ref the content of the pan and zoom editor sets to a function that takes
// a tap (target, event) on the svg. The editor calls it from usePanZoom.
const TapContext = createContext({ current: null });

export default TapContext;
