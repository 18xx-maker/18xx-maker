import { useTranslation } from "react-i18next";

import { editSections } from "@/components/editPanel/sections";

import { cn } from "@/util/cn";

export const tabId = (section) => `edit-tab-${section}`;
export const panelId = (section) => `edit-tabpanel-${section}`;

// The tabs of the edit panel. [ and ] switch between them (bindings.js), the
// arrow keys, Home and End move between them when a tab has the focus.
const EditTabs = ({ section, setSection }) => {
  const { t } = useTranslation();

  const onKeyDown = (event) => {
    const index = editSections.findIndex((s) => s.section === section);
    const last = editSections.length - 1;
    const target = {
      ArrowRight: index === last ? 0 : index + 1,
      ArrowLeft: index === 0 ? last : index - 1,
      Home: 0,
      End: last,
    }[event.key];
    if (target === undefined) return;

    event.preventDefault();
    const next = editSections[target].section;
    setSection(next);
    document.getElementById(tabId(next))?.focus();
  };

  return (
    <div className="flex flex-row flex-wrap items-center gap-2">
      <div
        role="tablist"
        aria-label={t("editPanel.tabs.label")}
        className="inline-flex flex-wrap rounded-md bg-muted p-1 text-foreground"
        onKeyDown={onKeyDown}
      >
        {editSections.map((item) => {
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
                "rounded-sm px-3 py-1 text-sm font-medium transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring",
                selected && "bg-background shadow-sm",
              )}
            >
              {t(`editPanel.sections.${item.section}.tab`)}
            </button>
          );
        })}
      </div>
      <span className="text-xs text-muted-foreground">
        <kbd>[</kbd> <kbd>]</kbd> {t("editPanel.tabs.hint")}
      </span>
    </div>
  );
};

export default EditTabs;
