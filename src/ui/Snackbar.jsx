import { useEffect, useRef } from "react";

import styles from "./Snackbar.module.css";
import cx from "./cx";

// MUI's Snackbar anchored bottom left: a fixed corner that holds one message
// (children) while open. After autoHideDuration ms (unset: never) it calls
// onClose; hovering it pauses the timer, and Escape calls onClose (so a message
// without autoHideDuration can be dismissed). A new message is a new element, so
// give it a key to restart the timer. There is no exit transition, it unmounts.
const Snackbar = ({
  open,
  autoHideDuration,
  onClose,
  className,
  children,
  ...props
}) => {
  const timer = useRef();
  const close = useRef(onClose);
  useEffect(() => {
    close.current = onClose;
  });

  const start = (ms) => {
    clearTimeout(timer.current);
    if (ms != null) {
      timer.current = setTimeout(() => close.current?.(), ms);
    }
  };
  const pause = () => clearTimeout(timer.current);
  const resume = () =>
    start(autoHideDuration == null ? null : autoHideDuration * 0.5);

  useEffect(() => {
    if (open) {
      start(autoHideDuration);
    }
    return pause;
  }, [open, autoHideDuration]);

  useEffect(() => {
    if (!open) {
      return;
    }
    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        close.current?.(event);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  if (!open) {
    return null;
  }

  return (
    <div
      className={cx(styles.root, className)}
      data-chrome="snackbar"
      onMouseEnter={pause}
      onMouseLeave={resume}
      {...props}
    >
      <div className={styles.content}>{children}</div>
    </div>
  );
};

export default Snackbar;
