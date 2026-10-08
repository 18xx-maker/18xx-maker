import { useMemo, useRef, useState } from "react";
import { useStore } from "react-redux";

import { equals } from "ramda";

import { useSelectedHex } from "@/hooks/useSelectedHex";
import {
  anchorOf,
  findGroup,
  groupInvalid,
  groupIssues,
  localHexes,
  newGroup,
  replaceGroup,
  setLocalHexes,
} from "@/util/hexEdit";
import { useIntParam } from "@/util/query";

const text = (value) => JSON.stringify(value, null, 2);

// The group of hexes selected on the map as a JSON editor lens, found by its
// first coordinate, the one in the url (?hex=C11).
export const useHexGroup = (game) => {
  const store = useStore();
  const slug = game.meta.slug;
  const [variation] = useIntParam("variation", 0);
  const { hex: anchor, select } = useSelectedHex();

  // State, so that a render that is thrown away or run twice changes nothing:
  // the anchor of the url at the last render, how many times the selection was
  // changed from outside (a click on the map: the editor starts over), and the
  // anchor our own edit moved the selection to, until the url has it
  const [sync, setSync] = useState({ seen: anchor, generation: 0, own: null });
  let now = sync;
  if (sync.seen !== anchor) {
    now = {
      seen: anchor,
      generation: sync.generation + (sync.own === anchor ? 0 : 1),
      own: null,
    };
    setSync(now);
  }
  const { generation } = now;
  const current = now.own ?? anchor;

  const urlAnchor = useRef(anchor);
  urlAnchor.current = anchor;
  const selectRef = useRef(select);
  selectRef.current = select;

  const lens = useMemo(() => {
    const state = { anchor: current };
    const at = (game) => findGroup(localHexes(game, variation), state.anchor);
    const group = (game) => {
      const index = at(game);
      return index < 0
        ? newGroup(state.anchor)
        : localHexes(game, variation)[index];
    };
    return {
      // Read when used: an edit that moves the anchor moves the key with it
      get draftKey() {
        return `${slug}#hex:${variation}:${state.anchor}`;
      },
      label: "hexEditor.label",
      lines: false,
      fold: false,
      text: (game) => text(group(game)),
      invalidReason: groupInvalid,
      same: (game, value) => equals(group(game), value),
      write: (game, value) =>
        setLocalHexes(
          game,
          variation,
          replaceGroup(localHexes(game, variation), at(game), value),
        ),
      // The selection follows the first coordinate of the group
      applied: (value) => {
        const next = anchorOf(value);
        state.anchor = next;
        if (next !== urlAnchor.current) {
          setSync((was) => ({ ...was, own: next }));
          selectRef.current(next);
        }
      },
      // The problems of this group, once the check is of the game as it is
      issues: (issues, done) => {
        if (!done) return [];
        return groupIssues(game, variation, at(store.getState().game), issues);
      },
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [generation, slug, variation]);

  return { current, generation, lens, variation, slug };
};
