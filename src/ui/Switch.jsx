import { forwardRef } from "react";

import styles from "./Switch.module.css";
import cx from "./cx";

// A native checkbox laid over a track and a thumb (it has no role of its own,
// like MUI's). Always primary.
const Switch = forwardRef(({ className, ...props }, ref) => (
  <span className={cx(styles.root, className)}>
    <input ref={ref} type="checkbox" className={styles.input} {...props} />
    <span className={styles.track} />
    <span className={styles.thumb} />
  </span>
));
Switch.displayName = "Switch";

export default Switch;
