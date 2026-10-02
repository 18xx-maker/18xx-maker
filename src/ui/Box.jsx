import { forwardRef } from "react";

// A plain element with no styles of its own. Layout belongs in a CSS Module
// class on the call site (there is no sx prop).
const Box = forwardRef(({ component: Component = "div", ...props }, ref) => (
  <Component ref={ref} {...props} />
));
Box.displayName = "Box";

export default Box;
