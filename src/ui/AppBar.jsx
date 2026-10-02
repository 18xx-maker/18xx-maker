import { forwardRef } from "react";

import styles from "./AppBar.module.css";
import cx from "./cx";

// position: "sticky" | "fixed" (default) | "static". Always the primary color.
// The hook for print CSS is data-chrome="app-bar".
const AppBar = forwardRef(
  ({ position = "fixed", className, ...props }, ref) => (
    <header
      ref={ref}
      data-chrome="app-bar"
      className={cx(styles.root, styles[position], className)}
      {...props}
    />
  ),
);
AppBar.displayName = "AppBar";

export default AppBar;
