import { forwardRef } from "react";

import styles from "./IconButton.module.css";
import { buttonProps } from "./buttonBase";
import cx from "./cx";

// color: "default" (the action color) | "inherit"
// size: "medium" (default) | "small"
// edge: "start" | false
const IconButton = forwardRef(
  (
    {
      color = "default",
      size = "medium",
      edge = false,
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
        color === "inherit" && styles.inherit,
        size === "small" && styles.small,
        edge === "start" && styles["edge-start"],
        disabled && styles.disabled,
        className,
      ),
    });
    return <Component ref={ref} {...base} {...props} />;
  },
);
IconButton.displayName = "IconButton";

export default IconButton;
