import { useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useStore } from "react-redux";

import { equals } from "ramda";

import JsonSection from "@/components/editPanel/JsonSection";

import { useSelectedHex } from "@/hooks/useSelectedHex";
import {
  anchorOf,
  findGroup,
  groupInvalid,
  groupPrefix,
  inheritedGroup,
  isRemoved,
  localHexes,
  newGroup,
  replaceGroup,
  rerootPointer,
  setLocalHexes,
  variationMap,
} from "@/util/hexEdit";
import { useIntParam } from "@/util/query";

const text = (value) => JSON.stringify(value, null, 2);

// The Hex tab: the group of hexes selected on the map, as JSON, in the JSON
// editor. The group is found by its first coordinate, the one in the url
// (?hex=C11): an edit of the text that changes the first coordinate moves the
// url along (and not the editor, which keeps the text and its cursor).
const HexSection = ({ game }) => {
  const { t } = useTranslation();
  const store = useStore();
  const slug = game.meta.slug;
  const [variation] = useIntParam("variation", 0);
  const { hex: anchor, select } = useSelectedHex();

  // The anchor our own edit moved the selection to, until the url has it
  const own = useRef(null);
  // The anchor of the url at the last render, and how many times the selection
  // was changed from outside (a click on the map): the editor starts over
  const seen = useRef(anchor);
  const generation = useRef(0);
  if (seen.current !== anchor) {
    seen.current = anchor;
    if (own.current !== anchor) generation.current += 1;
    own.current = null;
  }
  const current = own.current ?? anchor;

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
          own.current = next;
          selectRef.current(next);
        }
      },
      // The problems of this group, once the check is of the game as it is
      issues: (issues, done) => {
        const index = at(store.getState().game);
        if (!done || index < 0) return [];
        const prefix = groupPrefix(game, variation, index);
        return issues.flatMap((issue) => {
          const pointer = rerootPointer(issue.pointer, prefix);
          return pointer === null ? [] : [{ ...issue, pointer }];
        });
      },
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [generation.current, slug, variation]);

  if (!variationMap(game, variation)) return null;
  if (!current) return <p className="text-sm">{t("hexEditor.hint")}</p>;

  const index = findGroup(localHexes(game, variation), current);
  if (index < 0) {
    const inherited = inheritedGroup(game, variation, current);
    if (inherited) {
      return (
        <div className="flex flex-col gap-2">
          <p role="note" className="text-sm">
            {t("hexEditor.inherited", {
              variation:
                variationMap(game, inherited.variation).name ??
                inherited.variation + 1,
            })}
          </p>
          <pre className="text-sm font-mono border rounded-md p-2 overflow-auto">
            {text(inherited.group)}
          </pre>
        </div>
      );
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-2 min-h-0">
      {index < 0 && (
        <p role="note" className="text-sm">
          {isRemoved(game, variation, current)
            ? t("hexEditor.removed", { coord: current })
            : t("hexEditor.pending", { coord: current })}
        </p>
      )}
      <JsonSection
        key={`${slug}:${variation}:${generation.current}`}
        game={game}
        lens={lens}
      />
    </div>
  );
};

export default HexSection;
