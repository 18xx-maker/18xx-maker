import { forwardRef } from "react";

import styles from "./TextField.module.css";
import cx from "./cx";

// MUI's filled TextField: a native input on a tinted field with an underline
// and a label that floats up when the input has focus or a value. The label
// is wired to the input with htmlFor and gets the id "<id>-label". A native
// input, so every input prop (type, value, onChange, name) goes to it.
// className and style go to the outer element (the one to size).
const TextField = forwardRef(
  ({ id, label, error, className, style, ...props }, ref) => (
    <div className={cx(styles.root, className)} style={style}>
      {label && (
        <label id={id && `${id}-label`} htmlFor={id} className={styles.label}>
          {label}
        </label>
      )}
      <div className={styles.field}>
        <input
          ref={ref}
          id={id}
          // A placeholder that is shown only while the value is empty is how
          // the CSS knows to float the label
          placeholder=" "
          aria-invalid={error || undefined}
          className={styles.input}
          {...props}
        />
      </div>
    </div>
  ),
);
TextField.displayName = "TextField";

export default TextField;
