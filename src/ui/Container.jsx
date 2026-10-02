import { forwardRef } from "react";

import styles from "./Container.module.css";
import cx from "./cx";

// maxWidth: "md" | "lg" (the sizes the app uses)
const Container = forwardRef(
  ({ component: Component = "div", maxWidth, className, ...props }, ref) => (
    <Component
      ref={ref}
      className={cx(styles.root, maxWidth && styles[maxWidth], className)}
      {...props}
    />
  ),
);
Container.displayName = "Container";

export default Container;
