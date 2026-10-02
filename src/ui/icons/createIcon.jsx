import { forwardRef } from "react";

import styles from "./icons.module.css";

// Wraps an SVG component (loaded by vite-plugin-fast-react-svg) so it sizes
// and colors like a MUI SvgIcon: 1em square, currentColor, 1.5rem by default.
// The plugin camelCases attribute names (aria-hidden would become ariaHidden),
// so aria-hidden is set here, not in the files. data-testid matches MUI's
// ("TrainIcon") so queries survive the swap.
const createIcon = (Svg, name) => {
  const Icon = forwardRef(({ className, ...props }, ref) => (
    <Svg
      ref={ref}
      className={className ? `${styles.icon} ${className}` : styles.icon}
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
