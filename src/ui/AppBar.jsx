import { forwardRef } from "react";

import styles from "./AppBar.module.css";
import cx from "./cx";

// Always sticky, in the primary color.
// The hook for print CSS is data-chrome="app-bar".
const AppBar = forwardRef(({ className, ...props }, ref) => (
  <header
    ref={ref}
    data-chrome="app-bar"
    className={cx(styles.root, className)}
    {...props}
  />
));
AppBar.displayName = "AppBar";

export default AppBar;
