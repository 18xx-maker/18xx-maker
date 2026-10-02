import { forwardRef } from "react";

import styles from "./icons.module.css";

// Wraps an SVG component (loaded by vite-plugin-fast-react-svg) so it sizes
// and colors like a MUI SvgIcon: 1em square, currentColor, 1.5rem by default.
// color ("primary", "error", ...) and fontSize ("small", "large", "inherit")
// take the same values as MUI, so swapping an import is drop-in.
// The plugin camelCases attribute names (aria-hidden would become ariaHidden),
// so aria-hidden is set here, not in the files. data-testid matches MUI's
// ("TrainIcon") so queries survive the swap.
const createIcon = (Svg, name) => {
  const Icon = forwardRef(({ className, color, fontSize, ...props }, ref) => (
    <Svg
      ref={ref}
      className={[
        styles.icon,
        color && styles[`color-${color}`],
        fontSize && styles[`size-${fontSize}`],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      aria-hidden="true"
      focusable="false"
      data-testid={`${name}Icon`}
      {...props}
    />
  ));
  Icon.displayName = `${name}Icon`;
  return Icon;
};

export default createIcon;
