import { useTranslation } from "react-i18next";
import { Link } from "react-router";

import { X } from "lucide-react";

import { Button } from "@/components/ui/button";

import EditTabs, { panelId, tabId } from "@/components/editPanel/EditTabs";
import { editSections } from "@/components/editPanel/sections";

import { useGame } from "@/hooks/game";
import { useEditPanel } from "@/hooks/useEditPanel";
import { cn } from "@/util/cn";

// The forms for parts of the game beside the live render of the section
const EditPanel = () => {
  const { t } = useTranslation();
  const game = useGame();
  const { toggle, editSection, setEditSection } = useEditPanel();
  const { Form, wide } = editSections.find((s) => s.section === editSection);

  // Escape closes the panel from anywhere inside it. An open select closes
  // itself first, it has already claimed the key. The key is ours, so the
  // global bindings leave it alone.
  const onKeyDown = (event) => {
    if (event.key === "Escape" && !event.defaultPrevented) {
      event.preventDefault();
      toggle();
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
      <div className="flex flex-row items-center justify-between gap-4 p-4 border-b">
        <h1 className="text-3xl font-bold">{t("editPanel.title")}</h1>
        <Button
          variant="outline"
          size="icon"
          aria-label={t("editPanel.close")}
          onClick={toggle}
        >
          <X />
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto overscroll-contain p-4 flex flex-col gap-4">
        <EditTabs section={editSection} setSection={setEditSection} />
        <div
          role="tabpanel"
          id={panelId(editSection)}
          aria-labelledby={tabId(editSection)}
          className={cn("flex flex-col gap-4", wide && "flex-1 min-h-0")}
        >
          <p className="text-sm text-muted-foreground">
            {t(`editPanel.sections.${editSection}.description`)}
          </p>
          <Form game={game} />
        </div>
        <Button asChild variant="outline" className="self-start">
          <Link to={`/games/${game.meta.slug}/changes`}>
            {t("editPanel.changes")}
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default EditPanel;
