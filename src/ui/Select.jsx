import { Select as BaseSelect } from "@base-ui/react/select";
import { forwardRef, useState } from "react";

import styles from "./Select.module.css";
import cx from "./cx";
import { ArrowDropDown } from "./icons";

// MUI's Select, on Base UI's Select. A button with the combobox role opens a
// listbox of options.
//
// options: [{ value, label }]. Values are passed to onChange as given (numbers
// stay numbers). label is what the closed select and the option show.
// onChange gets an event-like { target: { name, value } }, the part of MUI's
// event the app reads.
// label: the floating label of the filled variant, with the id
// labelId (default "<id>-label"). Without label, labelId can name a label
// rendered elsewhere. Like MUI the name is the label then the selected text.
// variant: "filled" (a tinted field with an underline) or "outlined".
// className and style go to the outer element (the one to size).
// The listbox opens below the field, not over it as Base UI does by default.
const Select = forwardRef(
  (
    {
      id,
      name,
      label,
      labelId = id && `${id}-label`,
      variant = "filled",
      value,
      onChange,
      error,
      options,
      className,
      style,
      ...props
    },
    ref,
  ) => {
    const [open, setOpen] = useState(false);
    const filled = value !== undefined && value !== null && value !== "";

    return (
      <div
        ref={ref}
        className={cx(styles.root, styles[variant], className)}
        style={style}
        data-chrome="select"
        data-filled={filled || undefined}
        data-open={open || undefined}
        data-invalid={error || undefined}
      >
        <BaseSelect.Root
          id={id}
          name={name}
          items={options}
          value={filled ? value : null}
          onValueChange={(next) =>
            onChange?.({ target: { name, value: next } })
          }
          onOpenChange={setOpen}
          highlightItemOnHover={false}
        >
          {label && (
            <BaseSelect.Label id={labelId} className={styles.label}>
              {label}
            </BaseSelect.Label>
          )}
          <BaseSelect.Trigger
            className={styles.trigger}
            aria-invalid={error || undefined}
            aria-labelledby={labelId && id ? `${labelId} ${id}` : undefined}
            {...props}
          >
            <BaseSelect.Value className={styles.value} />
            <BaseSelect.Icon className={styles.icon}>
              <ArrowDropDown />
            </BaseSelect.Icon>
          </BaseSelect.Trigger>
          <BaseSelect.Portal>
            <BaseSelect.Positioner
              className={styles.positioner}
              alignItemWithTrigger={false}
              side="bottom"
              align="start"
              collisionPadding={16}
            >
              <BaseSelect.Popup
                className={styles.popup}
                data-chrome="select-popup"
                data-testid="select-popup"
              >
                <BaseSelect.List className={styles.list}>
                  {options.map((option) => (
                    <BaseSelect.Item
                      key={option.value}
                      value={option.value}
                      data-value={option.value}
                      className={styles.item}
                    >
                      <BaseSelect.ItemText>{option.label}</BaseSelect.ItemText>
                    </BaseSelect.Item>
                  ))}
                </BaseSelect.List>
              </BaseSelect.Popup>
            </BaseSelect.Positioner>
          </BaseSelect.Portal>
        </BaseSelect.Root>
      </div>
    );
  },
);
Select.displayName = "Select";

export default Select;
