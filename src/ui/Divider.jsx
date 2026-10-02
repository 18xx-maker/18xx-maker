import { forwardRef } from "react";

import styles from "./Divider.module.css";
import cx from "./cx";

// Horizontal rule (an hr, which has the separator role)
const Divider = forwardRef(({ className, ...props }, ref) => (
  <hr ref={ref} className={cx(styles.root, className)} {...props} />
));
Divider.displayName = "Divider";

export default Divider;
