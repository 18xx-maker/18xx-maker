import { forwardRef } from "react";

import styles from "./Fab.module.css";
import { buttonProps } from "./buttonBase";
import cx from "./cx";

// color: "primary" | "secondary" (the app never uses the grey default)
// Circular, 56px. The hook for print CSS is data-chrome="fab".
const Fab = forwardRef(
  (
    {
      color = "primary",
      disabled = false,
      className,
      component,
      type,
      ...props
    },
    ref,
  ) => {
    const { Component, props: base } = buttonProps({
      component,
      disabled,
      type,
      href: props.href,
      to: props.to,
      className: cx(
        styles.root,
        styles[color],
        disabled && styles.disabled,
        className,
      ),
    });
    return <Component ref={ref} {...base} {...props} data-chrome="fab" />;
  },
);
Fab.displayName = "Fab";

export default Fab;
