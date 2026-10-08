// The undo and redo of the hex editor, without a component: a history is the
// hexes before the current one (past) and the ones undone (future). Nothing
// here changes a history it is given.

export const LIMIT = 100;

export const emptyHistory = () => ({ past: [], future: [] });

// The history after the hex `previous` was replaced by a new one: the new
// change is a step, and what was undone cannot be redone any more
export const record = (history, previous) => ({
  past: [...history.past, previous].slice(-LIMIT),
  future: [],
});

// { history, value } for one step back from `current`, or null for none
export const undo = (history, current) => {
  if (history.past.length === 0) return null;
  const past = history.past.slice(0, -1);
  return {
    value: history.past[history.past.length - 1],
    history: { past, future: [current, ...history.future] },
  };
};

// { history, value } for one step forward from `current`, or null for none
export const redo = (history, current) => {
  if (history.future.length === 0) return null;
  const [value, ...future] = history.future;
  return {
    value,
    history: { past: [...history.past, current].slice(-LIMIT), future },
  };
};

// Which step a key press asks for: "undo", "redo" or null. Ctrl or Cmd with Z
// undoes, with Shift (or Y) redoes.
export const historyKey = (event) => {
  if (!(event.ctrlKey || event.metaKey) || event.altKey) return null;
  const key = event.key.toLowerCase();
  if (key === "z") return event.shiftKey ? "redo" : "undo";
  if (key === "y" && !event.shiftKey) return "redo";
  return null;
};
