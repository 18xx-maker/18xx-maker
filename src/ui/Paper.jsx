import { forwardRef } from "react";

import styles from "./Paper.module.css";
import cx from "./cx";

// elevation: 0 | 1 (default) | 4 | 5 | 10
const Paper = forwardRef(
  (
    {
      component: Component = "div",
      elevation = 1,
      square,
      className,
      ...props
    },
    ref,
  ) => (
    <Component
      ref={ref}
      className={cx(
        styles.root,
        !square && styles.rounded,
        styles[`elevation${elevation}`],
        className,
      )}
      {...props}
    />
  ),
);
Paper.displayName = "Paper";

export default Paper;
