import { forwardRef } from "react";

import styles from "./Button.module.css";
import { buttonProps } from "./buttonBase";
import cx from "./cx";

// variant: "text" (default) | "outlined" | "contained"
// color: "primary" (default) | "secondary" | "inherit"
// component: any element or component, e.g. a router Link
const Button = forwardRef(
  (
    {
      variant = "text",
      color = "primary",
      disabled = false,
      startIcon,
      endIcon,
      children,
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
        styles[variant],
        styles[color],
        disabled && styles.disabled,
        className,
      ),
    });
    return (
      <Component ref={ref} {...base} {...props}>
        {startIcon && <span className={styles.startIcon}>{startIcon}</span>}
        {children}
        {endIcon && <span className={styles.endIcon}>{endIcon}</span>}
      </Component>
    );
  },
);
Button.displayName = "Button";

export default Button;
