// The text of a JSON editor that does not parse yet, by game slug. It is only
// kept for the session (never stored), so switching tabs or closing the panel
// does not lose it.
const drafts = new Map();

export const getDraft = (slug) => drafts.get(slug);
export const setDraft = (slug, text) => drafts.set(slug, text);
export const clearDraft = (slug) => drafts.delete(slug);
export const resetDrafts = () => drafts.clear();
