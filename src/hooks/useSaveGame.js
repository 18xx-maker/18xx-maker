import { useCallback, useRef, useSyncExternalStore } from "react";
import { useSelector, useStore } from "react-redux";

import { useSaveAs } from "@/hooks/useSaveAs";
import { useNavigate } from "@/router";
import { CONFLICT, saveGame } from "@/state";
import { selectGameChanged, selectGameState } from "@/state/selectors";
import { canSaveGame } from "@/util/canSaveGame";

// What every way of saving (toolbar, Cmd/Ctrl+S, the File menu, the Changes
// page) shares: a save in flight, which ignores a second request, and the slug
// of the game whose file changed outside the app, which the Changes page
// offers to reload or overwrite.
let shared = { saving: false, conflict: undefined };
const listeners = new Set();

const update = (patch) => {
  shared = { ...shared, ...patch };
  listeners.forEach((listener) => listener());
};

const subscribe = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

const frame = () => new Promise((resolve) => requestAnimationFrame(resolve));

export const clearSaveConflict = () => update({ conflict: undefined });

// Saves the edited game over its file; a game without a file (bundled) is
// saved as a copy. A field being edited commits when it loses the focus, so
// the focus leaves it first and comes back afterwards. Never overwrites a file
// that changed outside the app: that goes to the Changes page (unless
// `redirect` is false, for the page itself). Resolves to SAVED, CONFLICT or
// FAILED, or undefined when nothing was saved.
export const useSaveGame = () => {
  const store = useStore();
  const navigate = useNavigate();
  const game = useSelector(selectGameState);
  const state = useSyncExternalStore(subscribe, () => shared);
  const saveAs = useSaveAs(game);

  // The save continues after a frame: it needs the latest of both
  const latest = useRef({});
  latest.current = { navigate, saveAs };

  const save = useCallback(
    async ({ force = false, redirect = true } = {}) => {
      if (shared.saving) return undefined;
      update({ saving: true });
      const active = document.activeElement;
      try {
        if (active instanceof HTMLElement && active !== document.body) {
          active.blur();
        }
        await frame();

        const current = store.getState();
        const edited = current.game;
        if (!edited || !selectGameChanged(current)) return undefined;

        if (!canSaveGame(edited.meta.type)) {
          if (latest.current.saveAs.available) latest.current.saveAs.start();
          return undefined;
        }

        const result = await store.dispatch(saveGame({ force }));
        if (result === CONFLICT) {
          update({ conflict: edited.meta.slug });
          if (redirect) {
            latest.current.navigate(`/games/${edited.meta.slug}/changes`);
          }
        } else {
          update({ conflict: undefined });
        }
        return result;
      } finally {
        update({ saving: false });
        if (
          active instanceof HTMLElement &&
          active.isConnected &&
          document.activeElement === document.body
        ) {
          active.focus({ preventScroll: true });
        }
      }
    },
    [store],
  );

  return {
    save,
    saving: state.saving,
    conflict: !!game && state.conflict === game.meta.slug,
    // Saves the file, or a copy of a game that has no file
    available: !!game && (canSaveGame(game.meta.type) || saveAs.available),
    saveAs: !!game && !canSaveGame(game.meta.type) && saveAs.available,
    dialog: saveAs.dialog,
  };
};
