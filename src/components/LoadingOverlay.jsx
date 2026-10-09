import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";

import { Loader2 } from "lucide-react";

import { selectLoadingGame } from "@/state/selectors";

// A card in the middle of the window while a dropped game is stored and read,
// so the app does not look frozen. It does not block the page. The delay is
// CSS only (opacity, backwards fill), so a fast load never shows it. `hidden`
// is for the drop overlay, which has the same place.
const LoadingOverlay = ({ hidden = false }) => {
  const { t } = useTranslation();
  const loading = useSelector(selectLoadingGame);

  if (!loading || hidden) return null;

  return (
    <div className="print:hidden pointer-events-none fixed inset-0 z-40 flex items-center justify-center">
      <div
        key={loading.id}
        role="status"
        aria-busy="true"
        data-testid="loading-game"
        className="flex w-72 max-w-[calc(100vw-2rem)] flex-col gap-3 rounded-lg border bg-popover p-4 text-popover-foreground shadow-lg [animation-delay:150ms] fill-mode-backwards motion-safe:animate-in motion-safe:fade-in-0 motion-safe:duration-150"
      >
        <div className="flex flex-row items-center gap-3">
          <Loader2
            aria-hidden="true"
            className="size-5 shrink-0 text-primary motion-safe:animate-spin"
          />
          <div className="min-w-0">
            <p className="text-sm font-medium">{t("alerts.loadingGame")}</p>
            {loading.name && (
              <p className="truncate text-sm text-muted-foreground">
                {t("alerts.loadingGameFile", { name: loading.name })}
              </p>
            )}
          </div>
        </div>
        <div
          aria-hidden="true"
          className="h-1 w-full overflow-hidden rounded-full bg-primary/20"
        >
          <div className="h-full w-2/5 rounded-full bg-primary motion-safe:animate-[loading-slide_1.2s_ease-in-out_infinite]" />
        </div>
      </div>
    </div>
  );
};

export default LoadingOverlay;
