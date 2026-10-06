import { EmacsHandler, emacs } from "@replit/codemirror-emacs";

import { keyTable } from "@/components/editPanel/editorKeyTable";
import { runAction } from "@/components/editPanel/editorKeys";

// Emacs keys, loaded when the mode is chosen. The bindings are the module's
// own (shared by every editor), so each looks up the actions of its view.
for (const [action, keys] of Object.entries(keyTable.emacs)) {
  if (action === "search") continue;
  for (const key of keys) {
    EmacsHandler.bindKey(key, (view) => runAction(view, action));
  }
}

export default [emacs()];
