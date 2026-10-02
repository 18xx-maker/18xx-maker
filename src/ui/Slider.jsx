import { Slider as BaseSlider } from "@base-ui/react/slider";

import styles from "./Slider.module.css";
import cx from "./cx";

// MUI's range Slider, on Base UI's Slider (pointer, touch and keyboard
// behavior, a hidden range input per thumb). It is a range slider: value is
// an array of numbers, one per thumb.
//
// onChange(value) while dragging, onChangeCommitted(value) on release or key
// press. marks: [{ value, label }] drawn under the rail. A bubble with the
// value shows above a thumb on hover and keyboard focus. getAriaLabel(index)
// names each thumb.
const Slider = ({
  value,
  onChange,
  onChangeCommitted,
  marks = [],
  getAriaLabel,
  className,
  ...props
}) => {
  const { min = 0, max = 100 } = props;
  const isActive = (mark) =>
    mark.value >= value[0] && mark.value <= value[value.length - 1];
  const percent = (v) => `${((v - min) / (max - min)) * 100}%`;

  return (
    <BaseSlider.Root
      value={value}
      onValueChange={onChange}
      onValueCommitted={onChangeCommitted}
      thumbAlignment="center"
      className={cx(styles.root, marks.length > 0 && styles.marked, className)}
      {...props}
    >
      <BaseSlider.Control className={styles.control}>
        {marks.map((mark) => (
          <span
            key={mark.value}
            className={cx(styles.mark, isActive(mark) && styles.markActive)}
            style={{ left: percent(mark.value) }}
          >
            <span
              className={cx(
                styles.markLabel,
                isActive(mark) && styles.markLabelActive,
              )}
            >
              {mark.label}
            </span>
          </span>
        ))}
        <BaseSlider.Track className={styles.track}>
          <BaseSlider.Indicator className={styles.indicator} />
          {value.map((v, index) => (
            <BaseSlider.Thumb
              key={index}
              index={index}
              getAriaLabel={getAriaLabel}
              className={styles.thumb}
            >
              <span className={styles.label}>{v}</span>
            </BaseSlider.Thumb>
          ))}
        </BaseSlider.Track>
      </BaseSlider.Control>
    </BaseSlider.Root>
  );
};

export default Slider;
