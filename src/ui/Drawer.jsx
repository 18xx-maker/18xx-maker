import { useEffect, useRef, useState } from "react";

import styles from "./Drawer.module.css";
import cx from "./cx";

// MUI's Drawer, in three variants. Plain elements and CSS transitions, no
// library: nothing here needs more than the platform gives.
//
// - "permanent": always there, fixed to the left edge.
// - "persistent": slides in and out while the page stays usable (no backdrop,
//   no focus trap, Escape does nothing). Closed, it is visibility:hidden, so
//   its content is out of the tab order and the accessibility tree.
// - "temporary": a modal panel over a dimmed backdrop (a click on it calls
//   onClose). The panel is role="dialog" aria-modal, named by aria-label.
//   Focus moves into it, Tab stays in it, the page behind does not scroll,
//   Escape calls onClose, and focus goes back to where it was when it closes.
//   It is not a
//   native <dialog>: showModal() puts it in the top layer, above the app bar,
//   which has to stay on top of the backdrop (z-index drawer + 1). It is
//   rendered in place, not portaled, so drops on the backdrop still bubble to
//   the app's #dropzone. Its content is only rendered while it is open or
//   leaving, so a closed drawer is not a second copy of its content.
//
// anchor: "left" (default) | "right". paperClassName styles the panel (width,
// z-index); className and the other props go to the root, which carries
// data-chrome="drawer" for the print CSS.
const Drawer = ({
  variant = "permanent",
  anchor = "left",
  open = false,
  onClose,
  className,
  paperClassName,
  children,
  ...props
}) => {
  if (variant === "temporary") {
    return (
      <Modal
        anchor={anchor}
        open={open}
        onClose={onClose}
        className={className}
        paperClassName={paperClassName}
        {...props}
      >
        {children}
      </Modal>
    );
  }

  return (
    <div
      className={cx(styles.docked, className)}
      data-chrome="drawer"
      {...props}
    >
      <div
        className={cx(
          styles.paper,
          styles[anchor],
          variant === "persistent" && styles.persistent,
          paperClassName,
        )}
        data-open={variant === "persistent" ? String(open) : undefined}
      >
        {children}
      </div>
    </div>
  );
};

const focusable =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

const Modal = ({
  anchor,
  open,
  onClose,
  className,
  paperClassName,
  children,
  "aria-label": label,
  ...props
}) => {
  const root = useRef(null);
  const panel = useRef(null);
  const [leaving, setLeaving] = useState(false);

  // Focus goes into the panel when it opens and back to where it was when it
  // closes, and the page behind does not scroll meanwhile. The content is
  // kept until the leaving transitions are done.
  useEffect(() => {
    if (open) {
      const before = document.activeElement;
      const element = root.current;
      const paper = panel.current;
      const page = document.documentElement;
      const overflow = page.style.overflow;
      page.style.overflow = "hidden";
      paper.focus({ preventScroll: true });
      return () => {
        page.style.overflow = overflow;
        if (!element.isConnected) {
          return;
        }
        // A click on the backdrop leaves the focus on body, not in the panel
        const active = document.activeElement;
        if (paper.contains(active) || active === document.body || !active) {
          before?.focus?.({ preventScroll: true });
        }
        setLeaving(true);
        Promise.all(
          element.getAnimations({ subtree: true }).map((a) => a.finished),
        )
          .catch(() => {})
          .then(() => setLeaving(false));
      };
    }
  }, [open]);

  const onKeyDown = (event) => {
    if (event.key === "Escape") {
      event.stopPropagation();
      onClose?.(event);
    } else if (event.key === "Tab") {
      // Tab stays inside the panel
      const items = [...panel.current.querySelectorAll(focusable)];
      const first = items[0] ?? panel.current;
      const last = items[items.length - 1] ?? panel.current;
      const active = document.activeElement;
      if (event.shiftKey && (active === first || active === panel.current)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    }
  };

  return (
    <div
      ref={root}
      className={cx(styles.modal, styles[`modal-${anchor}`], className)}
      data-chrome="drawer"
      data-open={String(open)}
      onKeyDown={onKeyDown}
      {...props}
    >
      <div className={styles.backdrop} onClick={onClose} aria-hidden="true" />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        tabIndex={-1}
        className={cx(styles.paper, styles.temporary, paperClassName)}
      >
        {(open || leaving) && children}
      </div>
    </div>
  );
};

export default Drawer;
