import { forwardRef } from "react";

import styles from "./Checkbox.module.css";
import cx from "./cx";

// A native checkbox, drawn in primary when checked. The wrapper is the hit
// area, and the ring after the input is its hover tint and focus ring (MUI's
// ripple is not replaced by one).
const Checkbox = forwardRef(({ className, ...props }, ref) => (
  <span className={cx(styles.root, className)}>
    <input ref={ref} type="checkbox" className={styles.input} {...props} />
    <span className={styles.ring} />
  </span>
));
Checkbox.displayName = "Checkbox";

export default Checkbox;
