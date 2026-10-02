import { forwardRef } from "react";

import styles from "./Alert.module.css";
import cx from "./cx";
import {
  ErrorOutline,
  InfoOutlined,
  ReportProblemOutlined,
  SuccessOutlined,
} from "./icons";

const icons = {
  success: SuccessOutlined,
  info: InfoOutlined,
  warning: ReportProblemOutlined,
  error: ErrorOutline,
};

// MUI's standard Alert. severity: "success" | "info" | "warning" | "error".
// An error or warning interrupts a screen reader (role="alert"), the others
// wait their turn (role="status"). Pass role to choose.
const Alert = forwardRef(
  (
    {
      severity = "success",
      role = severity === "error" || severity === "warning"
        ? "alert"
        : "status",
      className,
      children,
      ...props
    },
    ref,
  ) => {
    const Icon = icons[severity];
    return (
      <div
        ref={ref}
        role={role}
        className={cx(styles.root, styles[severity], className)}
        {...props}
      >
        <div className={styles.icon}>
          <Icon fontSize="inherit" />
        </div>
        <div className={styles.message}>{children}</div>
      </div>
    );
  },
);
Alert.displayName = "Alert";

export const AlertTitle = forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cx(styles.title, className)} {...props} />
));
AlertTitle.displayName = "AlertTitle";

export default Alert;
