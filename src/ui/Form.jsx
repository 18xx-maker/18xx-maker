import { forwardRef } from "react";

import styles from "./Form.module.css";
import Typography from "./Typography";
import cx from "./cx";

// Form layout: FormGroup (a column of controls), FormLabel (a group's
// legend) and FormControlLabel (a label around a Checkbox or Switch).

export const FormGroup = forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cx(styles.group, className)} {...props} />
));
FormGroup.displayName = "FormGroup";

// component: "legend" for a fieldset, a label otherwise
export const FormLabel = forwardRef(
  ({ component: Component = "label", className, ...props }, ref) => (
    <Component ref={ref} className={cx(styles.label, className)} {...props} />
  ),
);
FormLabel.displayName = "FormLabel";

// control: the Checkbox or Switch element
export const FormControlLabel = forwardRef(
  ({ control, label, className, ...props }, ref) => (
    <label ref={ref} className={cx(styles.controlLabel, className)} {...props}>
      {control}
      <Typography component="span">{label}</Typography>
    </label>
  ),
);
FormControlLabel.displayName = "FormControlLabel";
