import { forwardRef } from "react";

import styles from "./List.module.css";
import Typography from "./Typography";
import { buttonProps } from "./buttonBase";
import cx from "./cx";

// List family: List, ListItem, ListItemButton, ListItemIcon, ListItemText.
// Put every ListItemButton in a ListItem (<ListItem disablePadding>) so the
// list only has <li> children.

export const List = forwardRef(({ className, ...props }, ref) => (
  <ul ref={ref} className={cx(styles.list, className)} {...props} />
));
List.displayName = "List";

// A plain row. disablePadding is for a row that wraps a ListItemButton.
export const ListItem = forwardRef(
  ({ disablePadding, className, ...props }, ref) => (
    <li
      ref={ref}
      className={cx(
        styles.item,
        !disablePadding && styles.itemPadding,
        className,
      )}
      {...props}
    />
  ),
);
ListItem.displayName = "ListItem";

// A native button, or the element given as component (a router Link, a).
// Selected, disabled and the focus ring work the same on all of them.
export const ListItemButton = forwardRef(
  (
    { selected, disabled = false, className, component, type, ...props },
    ref,
  ) => {
    const { Component, props: base } = buttonProps({
      component,
      disabled,
      type,
      href: props.href,
      to: props.to,
      className: cx(
        styles.button,
        selected && styles.selected,
        disabled && styles.disabled,
        className,
      ),
    });
    return <Component ref={ref} {...base} {...props} />;
  },
);
ListItemButton.displayName = "ListItemButton";

export const ListItemIcon = forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cx(styles.icon, className)} {...props} />
));
ListItemIcon.displayName = "ListItemIcon";

// The text is primary, or the children when there is no primary
export const ListItemText = forwardRef(
  ({ primary, secondary, children, className, ...props }, ref) => {
    const text = primary ?? children;
    return (
      <div
        ref={ref}
        className={cx(
          styles.text,
          text != null && secondary != null && styles.multiline,
          className,
        )}
        {...props}
      >
        {text != null && (
          <Typography component="span" display="block">
            {text}
          </Typography>
        )}
        {secondary != null && (
          <Typography variant="body2" color="textSecondary" display="block">
            {secondary}
          </Typography>
        )}
      </div>
    );
  },
);
ListItemText.displayName = "ListItemText";
