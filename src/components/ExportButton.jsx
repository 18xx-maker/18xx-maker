import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useMatch } from "react-router";

import {
  Box,
  FileImage,
  FileText,
  Images,
  Settings2,
  Shapes,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import ExportOptions from "@/components/ExportOptions";
import KeyLabel from "@/components/KeyLabel";

import { useConfig, useGame } from "@/hooks";
import {
  createAlert,
  createSetExportMenuOpen,
  createSetExportSheetOpen,
} from "@/state";
import { selectExportMenuOpen, selectExportSheetOpen } from "@/state/selectors";
import { trackEvent } from "@/util/analytics";
import { planExport } from "@/util/exportPlan";
import { useBooleanParam } from "@/util/query";

const ExportButton = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const location = useLocation();
  const game = useGame();
  const { defaultConfig, userConfig, storedConfig } = useConfig();
  const layers = { defaultConfig, userConfig, storedConfig };
  // The "x" key binding (hooks/bindings) opens the menu through the store
  const menu = useSelector(selectExportMenuOpen);
  const options = useSelector(selectExportSheetOpen);
  const setMenu = (open) => dispatch(createSetExportMenuOpen(open));
  const setOptions = (open) => dispatch(createSetExportSheetOpen(open));
  const [print] = useBooleanParam("print");

  const match = useMatch("/games/:slug/*");
  const notOnGames = !match || match.params["*"] === "";

  const hidden = notOnGames || print || !game;

  // Leaving the game page closes the menu and sheet, otherwise the next game
  // page would open with them. Strict mode runs a cleanup right after the
  // first mount, so only a button that is still gone after it resets.
  const mounted = useRef(false);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      queueMicrotask(() => {
        if (!mounted.current) {
          dispatch(createSetExportMenuOpen(false));
          dispatch(createSetExportSheetOpen(false));
        }
      });
    };
  }, [dispatch]);

  if (hidden) {
    return null;
  }

  // The result, and progress, come as alerts from the main process
  const exportFiles = (request) =>
    window.api.export(request).catch((error) => {
      dispatch(createAlert(t("export.failed"), error.message, "error"));
    });

  const handleAll = (format) => {
    trackEvent("exportGame", location, { media: format });
    exportFiles(planExport(game, layers, { formats: [format] }));
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
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  aria-label={t("export.label")}
                  className="border rounded-sm p-2 w-8 h-8 m-0 print:hidden"
                >
                  <Images className="size-6" />
                </Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent>{t("export.label")}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <DropdownMenuContent align="end" onKeyDown={handleMenuKeyDown}>
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
          game={game}
          layers={layers}
          open={options}
          onOpenChange={setOptions}
        />
      )}
    </>
  );
};

export default ExportButton;
