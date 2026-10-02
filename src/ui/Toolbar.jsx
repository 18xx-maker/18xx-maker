import { forwardRef } from "react";

import styles from "./Toolbar.module.css";
import cx from "./cx";

// Regular variant with gutters, as the app uses it. As an empty element it is
// a spacer as tall as the app bar.
const Toolbar = forwardRef(
  ({ component: Component = "div", className, ...props }, ref) => (
    <Component ref={ref} className={cx(styles.root, className)} {...props} />
  ),
);
Toolbar.displayName = "Toolbar";

export default Toolbar;
