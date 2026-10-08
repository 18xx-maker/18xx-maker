import { useRef } from "react";
import { useTranslation } from "react-i18next";

import { Toggle } from "@/components/ui/toggle";

import NumberField from "@/components/form/NumberField";

// A whole number of at least min, or the infinity value ("∞"): a number field
// with arrows and a toggle for infinity. The number is kept while infinity is
// on, so turning it off brings it back.
const CountInput = ({
  value,
  onChange,
  onClear,
  onInvalid,
  min = 1,
  infinity = "∞",
  ...pass
}) => {
  const { t } = useTranslation();
  const last = useRef(min);
  const isInfinity = value === infinity;
  if (typeof value === "number") last.current = value;

  return (
    <div className="flex items-center gap-1.5">
      <NumberField
        {...pass}
        value={isInfinity ? undefined : value}
        min={min}
        step={1}
        placeholder={isInfinity ? infinity : undefined}
        disabled={isInfinity}
        onChange={(number) => {
          if (Number.isInteger(number) && number >= min) {
            onInvalid?.(false);
            onChange(number);
          } else {
            onInvalid?.(true);
          }
        }}
        onClear={isInfinity ? undefined : onClear}
        onInvalid={onInvalid}
        commitOnStep
        flush
      />
      <Toggle
        variant="outline"
        aria-label={t("editPanel.infinity")}
        pressed={isInfinity}
        onPressedChange={(on) => onChange(on ? infinity : last.current)}
      >
        {infinity}
      </Toggle>
    </div>
  );
};

export default CountInput;
