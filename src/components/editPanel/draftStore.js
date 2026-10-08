// The text of a JSON editor that does not parse yet, by game slug. It is only
// kept for the session (never stored), so switching tabs or closing the panel
// does not lose it.
const drafts = new Map();

const listeners = new Set();
const notify = () => listeners.forEach((listener) => listener());

// For useSyncExternalStore: called when a draft is set or cleared
export const subscribeDrafts = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

// The base is the game the text was written against, to tell when the game
// changed while the editor was closed
export const getDraft = (slug) => drafts.get(slug);
export const setDraft = (slug, text, base) => {
  drafts.set(slug, { text, base });
  notify();
};
export const clearDraft = (slug) => {
  const had = drafts.delete(slug);
  if (had) notify();
  return had;
};
// Clears every draft whose key starts with the prefix
export const clearDrafts = (prefix) => {
  let had = false;
  [...drafts.keys()].forEach((key) => {
    if (key.startsWith(prefix)) had = drafts.delete(key) || had;
  });
  if (had) notify();
  return had;
};
export const resetDrafts = () => {
  drafts.clear();
  notify();
};
