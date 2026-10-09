import { useEffect, useLayoutEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";

import { Box, FileImage, FileText, Settings2, Shapes } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import KeyLabel from "@/components/KeyLabel";
import ExportOptions from "@/components/export/ExportOptions";

import { useConfig, useLoadedGame } from "@/hooks";
import { useLocation } from "@/router";
import {
  createAlert,
  createSetExportMenuOpen,
  createSetExportSheetOpen,
} from "@/state";
import {
  selectAssets,
  selectExportMenuOpen,
  selectExportSheetOpen,
  selectGameForSlug,
  selectOpenExportFolder,
} from "@/state/selectors";
import { trackEvent } from "@/util/analytics";
import capability from "@/util/capability";
import { planExport } from "@/util/exportPlan";
import { useBooleanParam } from "@/util/query";

// Marks the buttons that open the menu (the toolbar button of the edit pages
// and the sidebar item), the menu opens next to the one that is on screen.
export const EXPORT_TRIGGER = "data-export-trigger";

// Where the menu opens when no trigger is on screen: the sidebar is collapsed
// or closed, or the page has no toolbar
const corner = () => ({
  top: 64,
  left: window.innerWidth - 16,
  width: 0,
  height: 0,
  side: "bottom",
});

const findAnchor = () => {
  const trigger = document.querySelector(`[${EXPORT_TRIGGER}]`);
  const rect = trigger?.getBoundingClientRect();

  // A collapsed sidebar is moved off screen, not removed
  if (!rect || rect.width === 0 || rect.right <= 0 || rect.left >= innerWidth) {
    return corner();
  }

  return {
    top: rect.top,
    left: rect.left,
    width: rect.width,
    height: rect.height,
    side: trigger.closest("[data-sidebar]") ? "right" : "bottom",
  };
};

// The export menu and options of the loaded game, one for the whole app. The
// buttons that open it only set the open flag in the store, as the "x" key
// does, so it works on every page, with the sidebar collapsed or closed and
// on the edit pages that have no sidebar. It exports the loaded game, not
// the game of the URL.
const ExportHost = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const location = useLocation();
  const loadedGame = useLoadedGame();
  const slug = loadedGame?.slug;
  const game = useSelector((state) => selectGameForSlug(state, slug));
  const { defaultConfig, userConfig, storedConfig } = useConfig();
  const layers = { defaultConfig, userConfig, storedConfig };
  const reveal = useSelector(selectOpenExportFolder);
  const assets = useSelector(selectAssets);
  const menu = useSelector(selectExportMenuOpen);
  const options = useSelector(selectExportSheetOpen);
  const setMenu = (open) => dispatch(createSetExportMenuOpen(open));
  const setOptions = (open) => dispatch(createSetExportSheetOpen(open));
  const [print] = useBooleanParam("print");
  const [anchor, setAnchor] = useState(corner);

  const hidden = !capability.electron || print || !game;

  // The flags do not outlive the game they were opened for
  useEffect(
    () => () => {
      dispatch(createSetExportMenuOpen(false));
      dispatch(createSetExportSheetOpen(false));
    },
    [slug, hidden, dispatch],
  );

  useLayoutEffect(() => {
    if (menu) setAnchor(findAnchor());
  }, [menu]);

  if (hidden) {
    return null;
  }

  // The result, and progress, come as alerts from the main process
  const exportFiles = (request) =>
    window.api.export({ ...request, reveal }).catch((error) => {
      dispatch(createAlert(t("export.failed"), error.message, "error"));
    });

  const handleAll = (format) => {
    trackEvent("exportGame", location, { media: format });
    exportFiles(planExport(game, layers, { formats: [format] }, assets));
  };

  // Keys inside the open menu, which must not reach the global key bindings
  const handleMenuKeyDown = (event) => {
    if (event.altKey || event.ctrlKey || event.metaKey) return;

    const actions = {
      p: () => handleAll("pdf"),
      n: () => handleAll("png"),
      s: () => handleAll("svg"),
      b: () => handleAll("b18"),
      o: () => setOptions(true),
    };
    const action = actions[event.key];

    if (action) {
      event.preventDefault();
      event.stopPropagation();
      setMenu(false);
      action();
    }
  };

  return (
    <>
      <DropdownMenu open={menu} onOpenChange={setMenu}>
        <DropdownMenuTrigger asChild>
          <span
            aria-hidden="true"
            tabIndex={-1}
            className="fixed pointer-events-none"
            style={{
              top: anchor.top,
              left: anchor.left,
              width: anchor.width,
              height: anchor.height,
            }}
          />
        </DropdownMenuTrigger>
        <DropdownMenuContent
          aria-label={t("export.label")}
          side={anchor.side}
          align={anchor.side === "right" ? "start" : "end"}
          onKeyDown={handleMenuKeyDown}
          // The menu has no trigger of its own to give the focus back to
          onCloseAutoFocus={(event) => event.preventDefault()}
        >
          <DropdownMenuItem onSelect={() => handleAll("pdf")}>
            <FileText />
            <span>
              <KeyLabel text={t("export.allPdf")} shortcut="p" word="pdf" />
            </span>
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => handleAll("png")}>
            <FileImage />
            <span>
              <KeyLabel text={t("export.allPng")} shortcut="n" word="png" />
            </span>
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => handleAll("svg")}>
            <Shapes />
            <span>
              <KeyLabel text={t("export.allSvg")} shortcut="s" word="svg" />
            </span>
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => handleAll("b18")}>
            <Box />
            <span>
              <KeyLabel text={t("export.b18")} shortcut="b" word="Board18" />
            </span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => setOptions(true)}>
            <Settings2 />
            <span>
              <KeyLabel
                text={t("export.options")}
                shortcut="o"
                word="options"
              />
            </span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      {options && (
        <ExportOptions
          key={slug}
          game={game}
          layers={layers}
          open={options}
          onOpenChange={setOptions}
        />
      )}
    </>
  );
};

export default ExportHost;
