import { Prec } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { Vim, getCM, vim } from "@replit/codemirror-vim";

import { keyTable } from "@/components/editPanel/editorKeyTable";
import { leave, runAction } from "@/components/editPanel/editorKeys";

// The Ex commands and keys, loaded when the mode is chosen. They are the
// module's own (shared by every editor), so each looks up the actions of the
// view it runs in.
const commands = {
  format: ["format", ""],
  apply: ["write", "w"],
  nextProblem: ["nextproblem", ""],
  prevProblem: ["prevproblem", ""],
  foldAll: ["foldall", ""],
  unfoldAll: ["unfoldall", ""],
};
for (const [action, [name, prefix]] of Object.entries(commands)) {
  Vim.defineEx(name, prefix, (cm) => runAction(cm.cm6, action));
  for (const key of keyTable.vim[action] ?? []) {
    if (!key.startsWith(":")) Vim.map(key, `:${name}<CR>`, "normal");
  }
}

// Not in insert or visual mode, nothing typed of a command: the Escape is
// the editor's, which leaves it (Vim's own would only clear nothing)
const idle = (view) => {
  const state = getCM(view)?.state.vim;
  return (
    !!state &&
    !state.insertMode &&
    !state.visualMode &&
    !state.inputState.keyBuffer.length &&
    !state.inputState.operator
  );
};

const escape = EditorView.domEventHandlers({
  keydown: (event, view) => {
    if (event.key !== "Escape" || !idle(view)) return false;
    event.preventDefault();
    return leave(view);
  },
});

export default [Prec.highest(escape), vim()];
