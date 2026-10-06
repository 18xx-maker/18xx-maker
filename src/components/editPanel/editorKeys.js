import { foldAll, unfoldAll } from "@codemirror/language";
import { nextDiagnostic, previousDiagnostic } from "@codemirror/lint";
import {
  closeSearchPanel,
  findNext,
  findPrevious,
  openSearchPanel,
} from "@codemirror/search";
import { Facet } from "@codemirror/state";
import { closeHoverTooltips, keymap } from "@codemirror/view";

import { keyTable } from "@/components/editPanel/editorKeyTable";

// What a key does, to a view. The editor provides its own through the facet
// so a wrapper loaded later (Emacs, Vim) finds the live ones.
export const defaultActions = {
  nextProblem: nextDiagnostic,
  prevProblem: previousDiagnostic,
  foldAll,
  unfoldAll,
  search: openSearchPanel,
  findNext,
  findPrevious,
};

export const editorActions = Facet.define({
  combine: (values) => ({ ...defaultActions, ...values[0] }),
});

export const runAction = (view, name) =>
  !!view.state.facet(editorActions)[name]?.(view);

// Escape leaves the editor unless it has a popup of its own to close
export const leave = (view) => {
  if (closeSearchPanel(view)) return true;
  if (view.dom.querySelector(".cm-tooltip")) {
    view.dispatch({ effects: closeHoverTooltips });
    return true;
  }
  view.contentDOM.blur();
  return true;
};

export const isMac = () =>
  typeof navigator !== "undefined" &&
  /Mac|iPhone|iPad/.test(navigator.platform);

// Shift makes the key a capital where the platform reports it so: only the
// capital name matches (with Shift left out of the name, except with Alt, where
// macOS reports the Option character instead). Only a key with Shift has a
// capital name: a key without it must not also match the capital, which
// belongs to the key with Shift.
const names = (key) => {
  const parts = key.split("-");
  const last = parts.pop();
  if (
    !parts.includes("Shift") ||
    last.length !== 1 ||
    last === last.toUpperCase()
  ) {
    return [key];
  }
  const capital = last.toUpperCase();
  return [
    key,
    (parts.includes("Alt")
      ? [...parts, capital]
      : parts.filter((part) => part !== "Shift").concat(capital)
    ).join("-"),
  ];
};

// The keymap of a mode. The Normal keys (Mod is Ctrl, or Cmd on macOS) are
// kept in the other modes only on macOS: elsewhere Ctrl belongs to them.
export const editorBindings = (mode, mac = isMac()) => {
  const normal = mode === "normal" || mac;
  // Vim's Escape is its own (editorVim leaves the editor when it is idle)
  const bindings = [
    { key: "Escape", run: mode === "vim" ? closeSearchPanel : leave },
    // In the search panel itself
    { key: "Escape", run: closeSearchPanel, scope: "search-panel" },
  ];
  if (normal) {
    for (const [action, keys] of Object.entries(keyTable.normal)) {
      if (action === "foldAll" || action === "unfoldAll") continue;
      for (const key of keys.flatMap(names)) {
        bindings.push({
          key,
          run: (view) => runAction(view, action),
          preventDefault: true,
        });
      }
    }
  }
  return bindings;
};

export const editorKeymap = (mode) => keymap.of(editorBindings(mode));
