import { forwardRef } from "react";

import styles from "./Link.module.css";
import Typography from "./Typography";
import cx from "./cx";

// color: "primary" (default) | "inherit"
// underline: "always" (default) | "hover" | "none"
// variant: any Typography variant, "inherit" by default
const Link = forwardRef(
  (
    {
      component = "a",
      color = "primary",
      underline = "always",
      variant = "inherit",
      className,
      ...props
    },
    ref,
  ) => (
    <Typography
      ref={ref}
      component={component}
      variant={variant}
      className={cx(
        styles[`color-${color}`],
        styles[`underline-${underline}`],
        className,
      )}
      {...props}
    />
  ),
);
Link.displayName = "Link";

export default Link;
