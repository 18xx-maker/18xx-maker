import { useEffect, useRef, useState } from "react";

import { Input } from "@/components/ui/input";

const format = (value) =>
  value === undefined || value === null ? "" : `${value}`;

// Keeps what is typed as text (so "1." and "-" can be typed) and only passes
// on a number when the field is left or Enter is pressed.
//
// Opt-in, for fields that can be empty: onClear is called when the text is
// emptied (it returns false to refuse), onInvalid(true) when the text is not a
// number (the text then stays, else it goes back to the value) and flush
// passes on what is typed when the field is removed.
const NumberField = ({
  value,
  onChange,
  onClear,
  onInvalid,
  flush = false,
  ...pass
}) => {
  const [text, setText] = useState(format(value));
  const input = useRef(null);
  const dirty = useRef(false);

  useEffect(() => {
    setText((text) =>
      text.trim() !== "" && Number(text) === value ? text : format(value),
    );
  }, [value]);

  const commit = () => {
    dirty.current = false;
    const number = Number(text);

    if (text.trim() !== "" && Number.isFinite(number)) {
      onInvalid?.(false);
      if (number !== value) {
        onChange(number);
      }
    } else if (
      text.trim() === "" &&
      onClear &&
      !input.current?.validity.badInput
    ) {
      onInvalid?.(false);
      if (value !== undefined && onClear() === false) {
        setText(format(value));
      }
    } else if (onInvalid) {
      onInvalid(true);
    } else {
      setText(format(value));
    }
  };

  const latest = useRef(commit);
  latest.current = commit;
  useEffect(
    () => () => {
      if (flush && dirty.current) latest.current();
    },
    [flush],
  );

  return (
    <Input
      ref={input}
      type="number"
      step="any"
      value={text}
      onChange={(event) => {
        dirty.current = true;
        setText(event.target.value);
      }}
      onBlur={commit}
      onKeyDown={(event) => event.key === "Enter" && commit()}
      {...pass}
    />
  );
};

export default NumberField;
