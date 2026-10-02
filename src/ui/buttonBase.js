import base from "./buttonBase.module.css";
import cx from "./cx";

// What the clickable primitives (Button, IconButton, Fab, ListItemButton) share:
// the element to render and the attributes that go with it. Mirrors MUI's
// ButtonBase: a native button by default, an <a> when there is an href, and
// for any other element (a router Link, a label) aria-disabled and tabIndex -1
// instead of the disabled attribute.
export const buttonProps = ({
  component = "button",
  disabled = false,
  type,
  href,
  to,
  className,
}) => {
  let Component = component;
  if (Component === "button" && (href || to)) Component = "a";

  const props = { className: cx(base.root, className) };
  if (Component === "button") {
    props.type = type === undefined ? "button" : type;
    props.disabled = disabled;
  } else {
    if (!href && !to) props.role = "button";
    if (disabled) props["aria-disabled"] = disabled;
    props.tabIndex = disabled ? -1 : 0;
  }
  return { Component, props };
};
