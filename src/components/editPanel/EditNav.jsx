import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";

import {
  COLOR_KEYS,
  GAME_INFO_KEYS,
  OUTPUT_KEYS,
  PLAYER_KEYS,
  ROUND_KEYS,
  TOKEN_KEYS,
  issuesFor,
} from "@/components/schemaForm/resolve";

import { useSelectedHex } from "@/hooks/useSelectedHex";
import { selectGameProblems } from "@/state";
import { cn } from "@/util/cn";
import {
  findGroup,
  groupPrefix,
  localHexes,
  rerootPointer,
} from "@/util/hexEdit";
import { useIntParam } from "@/util/query";

export const tabId = (section) => `edit-tab-${section}`;
export const panelId = (section) => `edit-tabpanel-${section}`;

// The top level keys of the game each form section edits, for the problem dot
// of its tab. The hex section is the selected group of the map instead.
export const SECTION_KEYS = {
  info: GAME_INFO_KEYS,
  players: [...PLAYER_KEYS, "players"],
  phases: ["phases"],
  rounds: ROUND_KEYS,
  companies: ["companies"],
  privates: ["privates"],
  tokens: TOKEN_KEYS,
  trains: ["trains"],
  market: ["stock"],
  colors: COLOR_KEYS,
  output: OUTPUT_KEYS,
};

// The game keys no form edits: they have a tab only in the JSON editor
export const UNTABBED_KEYS = ["groups", "tiles"];

// How many problems a section has. A deprecated field is a note, not a
// problem. No result yet (unknown) is no problem.
export const sectionProblems = (section, issues, hexIssues) => {
  const keys = SECTION_KEYS[section];
  const found = keys
    ? keys.flatMap((key) => issuesFor(issues, [key]))
    : section === "hex"
      ? hexIssues
      : [];
  return found.filter((issue) => issue.code !== "deprecated").length;
};

// A tab to focus once the chips are mounted (from the JSON editor they are not
// there yet): EditNav takes it after its commit
let pendingFocus = null;
export const focusTabAfterRender = (section) => {
  pendingFocus = section;
};

// The Forms | JSON switch of the edit panel header. JSON is a mode of its own
// (a wide code editor), the forms are the chips of EditNav.
export const EditSwitch = ({ json, formSection, setSection }) => {
  const { t } = useTranslation();
  const item = (active, label, onClick, testId) => (
    <button
      type="button"
      aria-pressed={active}
      data-testid={testId}
      onClick={onClick}
      className={cn(
        "rounded-sm px-3 py-1 text-sm font-medium transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring",
        active && "bg-background shadow-sm",
      )}
    >
      {label}
    </button>
  );

  return (
    <div
      role="group"
      aria-label={t("editPanel.nav.label")}
      className="inline-flex rounded-md bg-muted p-1 text-foreground"
    >
      {item(
        !json,
        t("editPanel.nav.forms"),
        () => setSection(formSection),
        "edit-switch-forms",
      )}
      {item(
        json,
        t("editPanel.sections.json.tab"),
        () => setSection("json"),
        "edit-switch-json",
      )}
    </div>
  );
};

// The form sections as chips under the group names, a tablist for each group
// (the arrow keys go through all of them). [ and ] switch between
// them (bindings.js), the arrow keys, Home and End move between them when a
// chip has the focus.
const EditNav = ({ game, groups, section, setSection }) => {
  const { t } = useTranslation();
  const sections = groups.flatMap((g) => g.sections);
  const issues = useSelector((state) =>
    selectGameProblems(state, game.meta.slug),
  );
  const [variation] = useIntParam("variation", 0);
  const { hex } = useSelectedHex();

  // The problems of the group selected on the map, for the hex tab
  const index = hex ? findGroup(localHexes(game, variation), hex) : -1;
  const prefix = index < 0 ? null : groupPrefix(game, variation, index);
  const hexIssues = (issues ?? []).filter(
    (issue) => prefix !== null && rerootPointer(issue.pointer, prefix) !== null,
  );

  useEffect(() => {
    if (!pendingFocus) return;
    document.getElementById(tabId(pendingFocus))?.focus();
    pendingFocus = null;
  });

  const onKeyDown = (event) => {
    const index = sections.findIndex((s) => s.section === section);
    const last = sections.length - 1;
    const target = {
      ArrowRight: index === last ? 0 : index + 1,
      ArrowLeft: index === 0 ? last : index - 1,
      Home: 0,
      End: last,
    }[event.key];
    if (target === undefined) return;

    event.preventDefault();
    const next = sections[target].section;
    setSection(next);
    document.getElementById(tabId(next))?.focus();
  };

  return (
    <div className="flex flex-col gap-2" onKeyDown={onKeyDown}>
      {groups.map(({ group, sections: items }) => (
        <div
          key={group}
          role="tablist"
          aria-label={t(`editPanel.groups.${group}`)}
          className="flex flex-row flex-wrap items-center gap-1"
        >
          <span
            aria-hidden="true"
            className="w-full text-xs font-medium uppercase tracking-wide text-muted-foreground"
          >
            {t(`editPanel.groups.${group}`)}
          </span>
          {items.map((item) => {
            const selected = item.section === section;
            const problems = sectionProblems(item.section, issues, hexIssues);
            return (
              <button
                key={item.section}
                type="button"
                role="tab"
                id={tabId(item.section)}
                aria-selected={selected}
                aria-controls={panelId(item.section)}
                tabIndex={selected ? 0 : -1}
                onClick={() => setSection(item.section)}
                className={cn(
                  "rounded-md border px-2.5 py-0.5 text-sm font-medium transition-colors hover:bg-muted focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring",
                  selected &&
                    "bg-foreground text-background border-foreground hover:bg-foreground",
                )}
              >
                {t(`editPanel.sections.${item.section}.tab`)}
                {problems > 0 && (
                  <>
                    {" "}
                    <span
                      aria-hidden="true"
                      data-testid={`edit-problem-${item.section}`}
                      className="ml-1.5 inline-block size-2 rounded-full bg-destructive align-middle"
                    />
                    <span className="sr-only">
                      {t("editPanel.nav.problems", { count: problems })}
                    </span>
                  </>
                )}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
};

export default EditNav;
