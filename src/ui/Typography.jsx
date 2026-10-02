import { forwardRef } from "react";

import styles from "./Typography.module.css";
import cx from "./cx";

// Same mapping as MUI's Typography (inherit renders a p there too)
const mapping = {
  h3: "h3",
  h4: "h4",
  h5: "h5",
  h6: "h6",
  subtitle1: "h6",
  body1: "p",
  body2: "p",
  caption: "span",
  inherit: "p",
};

// variant: h3 h4 h5 h6 subtitle1 body1 (default) body2 caption inherit
// color: "textSecondary" or unset
const Typography = forwardRef(
  (
    {
      variant = "body1",
      component,
      color,
      align,
      display,
      gutterBottom,
      noWrap,
      paragraph,
      className,
      ...props
    },
    ref,
  ) => {
    const Component = component || (paragraph ? "p" : mapping[variant]);
    return (
      <Component
        ref={ref}
        className={cx(
          styles.root,
          styles[variant],
          color === "textSecondary" && styles.textSecondary,
          align === "center" && styles.alignCenter,
          display === "block" && styles.displayBlock,
          gutterBottom && styles.gutterBottom,
          noWrap && styles.noWrap,
          paragraph && styles.paragraph,
          className,
        )}
        {...props}
      />
    );
  },
);
Typography.displayName = "Typography";

export default Typography;
