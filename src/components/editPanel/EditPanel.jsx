import { useTranslation } from "react-i18next";
import { Link } from "react-router";

import { X } from "lucide-react";

import { Button } from "@/components/ui/button";

import EditNav, {
  EditSwitch,
  panelId,
  tabId,
} from "@/components/editPanel/EditNav";
import FieldSearch from "@/components/editPanel/FieldSearch";

import { useGame } from "@/hooks/game";
import { useEditPanel } from "@/hooks/useEditPanel";
import { useSelectedHex } from "@/hooks/useSelectedHex";
import { cn } from "@/util/cn";

// The forms for parts of the game beside the live render of the section
const EditPanel = () => {
  const { t } = useTranslation();
  const game = useGame();
  const {
    toggle,
    sections,
    groups,
    formSection,
    json,
    editSection,
    setEditSection,
  } = useEditPanel();
  const { hex, clear } = useSelectedHex();
  const { Form, wide } = sections.find((s) => s.section === editSection);

  // Escape closes the panel from anywhere inside it. An open select closes
  // itself first, it has already claimed the key. A selected hex is cleared
  // first. The key is ours, so the global bindings leave it alone.
  const onKeyDown = (event) => {
    if (event.key === "Escape" && !event.defaultPrevented) {
      event.preventDefault();
      if (hex) clear();
      else toggle();
    }
  };

  return (
    <div
      data-edit-panel
      data-testid="edit-panel"
      role="complementary"
      aria-label={t("editPanel.title")}
      onKeyDown={onKeyDown}
      className={cn(
        "print:hidden z-50 fixed inset-0 md:left-auto md:min-w-96 flex flex-col bg-background md:border-l shadow-lg",
        wide ? "md:w-1/2" : "md:w-1/3",
      )}
    >
      <div className="flex flex-col gap-3 p-4 border-b">
        <div className="flex flex-row flex-wrap items-center justify-between gap-x-4 gap-y-2">
          <h1 className="text-2xl font-bold">{t("editPanel.title")}</h1>
          <div className="flex flex-row items-center gap-2">
            <EditSwitch
              json={json}
              formSection={formSection}
              setSection={setEditSection}
            />
            <Button
              variant="outline"
              size="icon"
              aria-label={t("editPanel.close")}
              onClick={toggle}
            >
              <X />
            </Button>
          </div>
        </div>
        {!json && (
          <EditNav
            game={game}
            groups={groups}
            section={editSection}
            setSection={setEditSection}
          />
        )}
        {!json && (
          <FieldSearch key={editSection} panel={panelId(editSection)} />
        )}
      </div>
      <div className="flex-1 overflow-y-auto overscroll-contain p-4 flex flex-col gap-4">
        <div
          {...(json
            ? {
                role: "region",
                "aria-label": t("editPanel.sections.json.tab"),
              }
            : {
                role: "tabpanel",
                "aria-labelledby": tabId(editSection),
              })}
          id={panelId(editSection)}
          className={cn("flex flex-col gap-4", wide && "flex-1 min-h-0")}
        >
          <p className="text-sm text-muted-foreground">
            {t(`editPanel.sections.${editSection}.description`)}
          </p>
          <Form game={game} />
        </div>
        <div className="flex flex-col items-start gap-1">
          <Button asChild variant="outline">
            <Link to={`/games/${game.meta.slug}/changes`}>
              {t("editPanel.changes")}
            </Link>
          </Button>
          <p className="text-xs text-muted-foreground">
            {t("editPanel.memoryNote")}
          </p>
        </div>
      </div>
    </div>
  );
};

export default EditPanel;
