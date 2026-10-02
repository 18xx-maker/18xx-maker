import { forwardRef } from "react";

import styles from "./Checkbox.module.css";
import cx from "./cx";

// A native checkbox, drawn in primary when checked. The wrapper is the hit
// area and carries the hover and focus ring (MUI's ripple is not replaced by
// one).
const Checkbox = forwardRef(({ className, ...props }, ref) => (
  <span className={cx(styles.root, className)}>
    <input ref={ref} type="checkbox" className={styles.input} {...props} />
  </span>
));
Checkbox.displayName = "Checkbox";

export default Checkbox;
