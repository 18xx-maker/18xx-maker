import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSelector, useStore } from "react-redux";

import JsonSection from "@/components/editPanel/JsonSection";
import { clearDraft, getDraft } from "@/components/editPanel/draftStore";
import LazyHexEditor from "@/components/hexEditor/LazyHexEditor";

import { useHexGroup } from "@/hooks/useHexGroup";
import { editGame, selectGameProblems } from "@/state";
import {
  findGroup,
  findGroups,
  inheritedGroup,
  isRemoved,
  localHexes,
  moveKey,
  newGroup,
  setLocalHexes,
  variationMap,
} from "@/util/hexEdit";

const text = (value) => JSON.stringify(value, null, 2);

const VIEWS = ["form", "json"];

// Form or JSON: radio buttons, so the arrow keys move between them
const ViewToggle = ({ view, onChange }) => {
  const { t } = useTranslation();
  return (
    <div
      role="radiogroup"
      aria-label={t("hexEditor.view.label")}
      className="inline-flex self-start rounded-md border"
    >
      {VIEWS.map((name) => (
        <label
          key={name}
          className="cursor-pointer px-3 py-1 text-sm first:rounded-l-md last:rounded-r-md has-checked:bg-accent has-checked:font-medium has-focus-visible:ring-1 has-focus-visible:ring-ring"
        >
          <input
            type="radio"
            name="hex-view"
            className="sr-only"
            checked={view === name}
            onChange={() => onChange(name)}
          />
          {t(`hexEditor.view.${name}`)}
        </label>
      ))}
    </div>
  );
};

// The Hex tab: the group of hexes selected on the map, as a form (a drawing of
// the hex, its elements and their fields) or as JSON, in the JSON editor. The
// group is found by its first coordinate, the one in the url (?hex=C11): an
// edit that changes the first coordinate moves the url along (and not the
// editor, which keeps the text and its cursor). The form is the group while
// it is shown; the JSON view starts over from the group each time it opens.
const HexSection = ({ game }) => {
  const { t } = useTranslation();
  const store = useStore();
  const { current, generation, lens, variation, slug } = useHexGroup(game);
  const [view, setView] = useState("form");
  // The generation in which a switch to the form was refused
  const [refused, setRefused] = useState(null);
  const allIssues = useSelector((state) => selectGameProblems(state, slug));
  const checked = useSelector(
    (state) => state.gameProblems.status !== "running",
  );
  const issues = useMemo(
    () => allIssues && lens.issues(allIssues, checked),
    [allIssues, checked, lens],
  );

  const apply = useCallback(
    (value) => {
      store.dispatch(editGame((latest) => lens.write(latest, value)));
      lens.applied(value);
    },
    [store, lens],
  );

  if (!variationMap(game, variation)) return null;
  if (!current) return <p className="text-sm">{t("hexEditor.hint")}</p>;

  const hexes = localHexes(game, variation);
  const index = findGroup(hexes, current);
  const inherited = index < 0 ? inheritedGroup(game, variation, current) : null;
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
        <button
          type="button"
          className="self-start rounded-md border px-3 py-1 text-sm hover:bg-accent focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
          onClick={() =>
            store.dispatch(
              editGame((latest) =>
                setLocalHexes(latest, variation, [
                  ...localHexes(latest, variation),
                  { ...structuredClone(inherited.group), hexes: [current] },
                ]),
              ),
            )
          }
        >
          {t("hexEditor.override")}
        </button>
        <pre className="text-sm font-mono border rounded-md p-2 overflow-auto">
          {text(inherited.group)}
        </pre>
      </div>
    );
  }

  const removed = index < 0 && isRemoved(game, variation, current);
  const group = index >= 0 ? hexes[index] : newGroup(current);
  const others = findGroups(hexes, current).filter((i) => i !== index);
  const count = group.hexes?.length ?? 1;
  const orientation = game.info?.orientation === "horizontal" ? 0 : 90;
  const form = view === "form" && !removed;

  const choose = (next) => {
    if (next === "json") {
      // The JSON starts over from the group the form made
      clearDraft(lens.draftKey);
      setRefused(null);
      setView("json");
    } else if (getDraft(lens.draftKey)) {
      setRefused(generation);
    } else {
      setRefused(null);
      setView("form");
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-2 min-h-0" data-anchor={current}>
      {index < 0 && (
        <p role="note" className="text-sm">
          {removed
            ? t("hexEditor.removed", { coord: current })
            : t("hexEditor.pending", { coord: current })}
        </p>
      )}
      {!removed && (
        <>
          <ViewToggle view={view} onChange={choose} />
          {refused === generation && view === "json" && (
            <p role="alert" className="text-sm text-destructive">
              {t("hexEditor.view.blocked")}
            </p>
          )}
          <p className="text-sm text-muted-foreground">
            {t("hexEditor.moveHint", { key: moveKey() })}
          </p>
          {count > 1 && (
            <p role="note" className="text-sm text-warning-text">
              {t("hexEditor.appliesTo", { count })}
            </p>
          )}
          {others.length > 0 && (
            <p role="note" className="text-sm text-muted-foreground">
              {t("hexEditor.alsoIn", {
                coord: current,
                groups: others.map((i) => `#${i + 1}`).join(", "),
              })}
            </p>
          )}
        </>
      )}
      {form ? (
        <LazyHexEditor
          key={`${slug}:${variation}:${generation}`}
          value={group}
          onChange={apply}
          orientation={orientation}
          game={game}
          issues={issues}
        />
      ) : (
        <JsonSection
          key={`${slug}:${variation}:${generation}`}
          game={game}
          lens={lens}
        />
      )}
    </div>
  );
};

export default HexSection;
