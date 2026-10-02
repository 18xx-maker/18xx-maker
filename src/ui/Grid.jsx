import { forwardRef } from "react";

import styles from "./Grid.module.css";
import cx from "./cx";

const breakpointKeys = ["xs", "sm", "md", "lg"];

// The Grid2 subset the app uses: a 12 column flex container with a gap
// (<Grid container spacing={2}>) and items sized per breakpoint
// (<Grid size={{ xs: 6, sm: 4 }}>). An item with no size is left as is.
const Grid = forwardRef(
  ({ container, spacing, size, className, style, ...props }, ref) => {
    const vars = {};
    if (spacing !== undefined) {
      vars["--grid-gap"] = `calc(var(--space) * ${spacing})`;
    }
    if (size) {
      for (const key of breakpointKeys) {
        if (size[key] !== undefined) vars[`--grid-${key}`] = size[key];
      }
    }
    return (
      <div
        ref={ref}
        className={cx(
          container && styles.container,
          size && styles.item,
          className,
        )}
        style={{ ...vars, ...style }}
        {...props}
      />
    );
  },
);
Grid.displayName = "Grid";

export default Grid;
