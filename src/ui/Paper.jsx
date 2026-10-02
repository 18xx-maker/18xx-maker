import { forwardRef } from "react";

import styles from "./Paper.module.css";
import cx from "./cx";

// elevation: 1 (default) | 5 | 10
const Paper = forwardRef(
  (
    { component: Component = "div", elevation = 1, className, ...props },
    ref,
  ) => (
    <Component
      ref={ref}
      className={cx(
        styles.root,
        styles.rounded,
        styles[`elevation${elevation}`],
        className,
      )}
      {...props}
    />
  ),
);
Paper.displayName = "Paper";

export default Paper;
