import styles from "./Progress.module.css";
import cx from "./cx";

// MUI's determinate LinearProgress: a 4px bar, primary color. value: 0 to 100.
// It is a progressbar, label it (aria-label) when nothing near it does.
export const LinearProgress = ({ value = 0, className, ...props }) => (
  <div
    role="progressbar"
    aria-valuemin={0}
    aria-valuemax={100}
    aria-valuenow={Math.round(value)}
    className={cx(styles.linear, className)}
    {...props}
  >
    <div
      className={styles.bar}
      style={{ transform: `translateX(${value - 100}%)` }}
    />
  </div>
);

// MUI's indeterminate CircularProgress: a 40px spinner, primary color
export const CircularProgress = ({ className, ...props }) => (
  <span
    role="progressbar"
    className={cx(styles.circular, className)}
    {...props}
  >
    <svg viewBox="22 22 44 44" className={styles.svg}>
      <circle cx="44" cy="44" r="20.2" fill="none" strokeWidth="3.6" />
    </svg>
  </span>
);
