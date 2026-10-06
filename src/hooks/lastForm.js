// The form section the edit panel was on before the JSON switch, so Forms goes
// back to it. Not persisted; the hook and the bindings share it. Only an open
// panel on a form updates it.
let lastForm = null;

export const getLastForm = () => lastForm;
export const setLastForm = (section) => {
  lastForm = section;
};
export const resetLastForm = () => {
  lastForm = null;
};
