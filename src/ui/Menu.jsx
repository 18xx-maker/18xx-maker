import { Menu as BaseMenu } from "@base-ui/react/menu";
import { createElement, forwardRef } from "react";

import styles from "./Menu.module.css";
import cx from "./cx";

// MUI's Menu, on Base UI's Menu: a popup of actions or links, opened from a
// button the caller owns. DropdownMenu is the name because "Menu" is the
// hamburger icon.
//
// anchorEl: the button the menu opens over, with its top right corner on the
// button's. open and onClose are controlled, as in MUI (onClose is called on
// Escape and on a click outside). The popup has role="menu" and the id.
// Arrow keys, Home, End and typing move through the items, Escape closes and
// the focus goes back to the button.
export const DropdownMenu = ({ id, anchorEl, open, onClose, children }) => (
  <BaseMenu.Root
    open={open}
    onOpenChange={(next) => {
      if (!next) onClose?.();
    }}
    highlightItemOnHover={false}
  >
    <BaseMenu.Portal>
      <BaseMenu.Positioner
        anchor={anchorEl}
        className={styles.positioner}
        side="bottom"
        align="end"
        sideOffset={({ anchor }) => -anchor.height}
        collisionPadding={16}
      >
        <BaseMenu.Popup id={id} className={styles.popup} data-chrome="menu">
          {children}
        </BaseMenu.Popup>
      </BaseMenu.Positioner>
    </BaseMenu.Portal>
  </BaseMenu.Root>
);

// An action (onClick), or a link when component is given (a router Link with
// its to). A click closes the menu. selected marks the current page.
export const MenuItem = forwardRef(
  ({ selected, component, className, onClick, ...props }, ref) => {
    const common = {
      ref,
      className: cx(styles.item, selected && styles.selected, className),
      onClick,
    };
    if (component) {
      return (
        <BaseMenu.LinkItem
          {...common}
          closeOnClick
          render={createElement(component, {
            ...props,
            "aria-current": selected ? "page" : undefined,
          })}
        />
      );
    }
    return <BaseMenu.Item {...common} {...props} />;
  },
);
MenuItem.displayName = "MenuItem";

export const MenuDivider = forwardRef(({ className, ...props }, ref) => (
  <BaseMenu.Separator
    ref={ref}
    className={cx(styles.divider, className)}
    {...props}
  />
));
MenuDivider.displayName = "MenuDivider";
