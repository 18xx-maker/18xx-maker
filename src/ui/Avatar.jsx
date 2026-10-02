import { forwardRef } from "react";

import styles from "./Avatar.module.css";
import cx from "./cx";

// variant: "circular" (default) | "square". Children only (no image support).
const Avatar = forwardRef(({ variant, className, ...props }, ref) => (
  <div
    ref={ref}
    className={cx(
      styles.root,
      variant === "square" && styles.square,
      className,
    )}
    {...props}
  />
));
Avatar.displayName = "Avatar";

export default Avatar;
