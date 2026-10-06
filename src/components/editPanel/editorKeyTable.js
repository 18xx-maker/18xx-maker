// The keys of the JSON editor per mode: the one list the keymap, the Emacs and
// Vim wrappers and the shortcuts table all read (it has no imports, so the
// shortcuts page does not pull in the editor). A key is a CodeMirror key name
// (Normal), an Emacs chain ("C-x C-s") or Vim keys and Ex commands. Search in
// Emacs (C-s, C-r) and Vim (/, ?) is the mode's own.
export const keyTable = {
  normal: {
    format: ["Mod-Shift-f", "Shift-Alt-f"],
    apply: ["Mod-s"],
    nextProblem: ["F8"],
    prevProblem: ["Shift-F8"],
    search: ["Mod-f"],
    findNext: ["Mod-g"],
    findPrevious: ["Shift-Mod-g"],
    foldAll: ["Ctrl-Alt-["],
    unfoldAll: ["Ctrl-Alt-]"],
  },
  emacs: {
    format: ["C-c C-f"],
    apply: ["C-x C-s"],
    nextProblem: ["M-g n"],
    prevProblem: ["M-g p"],
    search: ["C-s", "C-r"],
  },
  vim: {
    format: [":format"],
    apply: [":w"],
    nextProblem: ["]d"],
    prevProblem: ["[d"],
    search: ["/", "?"],
    foldAll: ["zM"],
    unfoldAll: ["zR"],
  },
};
