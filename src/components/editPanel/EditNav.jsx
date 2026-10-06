import { useEffect } from "react";
import { useTranslation } from "react-i18next";

import { cn } from "@/util/cn";

export const tabId = (section) => `edit-tab-${section}`;
export const panelId = (section) => `edit-tabpanel-${section}`;

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
const EditNav = ({ groups, section, setSection }) => {
  const { t } = useTranslation();
  const sections = groups.flatMap((g) => g.sections);

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
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
};

export default EditNav;
