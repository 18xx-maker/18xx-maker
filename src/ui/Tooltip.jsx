import { Tooltip as BaseTooltip } from "@base-ui/react/tooltip";
import { forwardRef } from "react";

import styles from "./Tooltip.module.css";

// MUI's Tooltip, on Base UI's Tooltip: a small label on a dark box that shows
// on hover and keyboard focus of its child, which must be one element that
// takes a ref (a Fab, a Button). The tooltip does not name the child: give it
// aria-label (this component passes it on) like the app always did.
//
// title: the text. placement: "top", "bottom", "left" or "right" (the side of
// the child). arrow: draw the arrow. Other props, and the ref, go to the
// child, so a Slide around a Tooltip still moves the child.
// The popup has data-testid="tooltip" and data-chrome="tooltip", which the
// print CSS hides.
const Tooltip = forwardRef(
  ({ title, placement = "bottom", arrow, children, ...props }, ref) => (
    <BaseTooltip.Root>
      <BaseTooltip.Trigger
        ref={ref}
        delay={100}
        closeDelay={0}
        render={children}
        {...props}
      />
      <BaseTooltip.Portal>
        <BaseTooltip.Positioner
          className={styles.positioner}
          side={placement}
          sideOffset={14}
          data-testid="tooltip"
          data-chrome="tooltip"
        >
          <BaseTooltip.Popup className={styles.popup}>
            {title}
            {arrow && <BaseTooltip.Arrow className={styles.arrow} />}
          </BaseTooltip.Popup>
        </BaseTooltip.Positioner>
      </BaseTooltip.Portal>
    </BaseTooltip.Root>
  ),
);
Tooltip.displayName = "Tooltip";

export default Tooltip;
