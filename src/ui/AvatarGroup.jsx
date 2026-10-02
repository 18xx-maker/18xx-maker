import { forwardRef } from "react";

import styles from "./AvatarGroup.module.css";
import cx from "./cx";

// Overlapping avatars, the last one in the DOM is drawn first (row-reverse).
// No max/surplus handling.
const AvatarGroup = forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cx(styles.root, className)} {...props} />
));
AvatarGroup.displayName = "AvatarGroup";

export default AvatarGroup;
