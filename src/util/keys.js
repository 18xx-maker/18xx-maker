// Keys typed into a text field or a form control (Radix selects, switches and
// checkboxes are buttons with a role) belong to that control, not to the
// global key bindings. The code editor (CodeMirror) is a contenteditable.
const controls =
  'textarea, input, select, [role="combobox"], [role="listbox"], [role="option"], [role="switch"], [role="checkbox"], [role="slider"], .cm-editor, [contenteditable="true"]';

export const isControlTarget = (event) =>
  event.target instanceof Element && event.target.closest(controls) !== null;
