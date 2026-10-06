// The text of a JSON editor that does not parse yet, by game slug. It is only
// kept for the session (never stored), so switching tabs or closing the panel
// does not lose it.
const drafts = new Map();

// The base is the game the text was written against, to tell when the game
// changed while the editor was closed
export const getDraft = (slug) => drafts.get(slug);
export const setDraft = (slug, text, base) => drafts.set(slug, { text, base });
export const clearDraft = (slug) => drafts.delete(slug);
export const resetDrafts = () => drafts.clear();
