import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import { useLocation, useMatch, useNavigate } from "react-router";

import { Box, FileImage, FileText, Images, Settings2 } from "lucide-react";

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

import { useConfig, useGame } from "@/hooks";
import { createAlert } from "@/state";
import { trackEvent } from "@/util/analytics";
import { planExport } from "@/util/exportPlan";
import { isControlTarget } from "@/util/keys";
import { useBooleanParam } from "@/util/query";

const ExportButton = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const game = useGame();
  const { defaultConfig, userConfig, storedConfig } = useConfig();
  const layers = { defaultConfig, userConfig, storedConfig };
  const [options, setOptions] = useState(false);
  // The "x" binding navigates here with this state when no game was showing
  const [menu, setMenu] = useState(!!location.state?.exportMenu);
  const [print] = useBooleanParam("print");

  const match = useMatch("/games/:slug/*");
  const notOnGames = !match || match.params["*"] === "";

  const hidden = notOnGames || print || !game;

  useEffect(() => {
    if (location.state?.exportMenu) {
      navigate(location, { replace: true, state: null });
    }
  }, [location, navigate]);

  useEffect(() => {
    if (hidden) return;

    const onKeyDown = (event) => {
      if (isControlTarget(event)) return;
      if (event.altKey || event.ctrlKey || event.metaKey) return;
      if (event.key === "x") setMenu(true);
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [hidden]);

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
                  aria-label="Export"
                  className="border rounded-sm p-2 w-8 h-8 m-0 print:hidden"
                >
                  <Images className="size-6" />
                </Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent>Export</TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <DropdownMenuContent align="end" onKeyDown={handleMenuKeyDown}>
          <DropdownMenuItem onSelect={() => handleAll("pdf")}>
            <FileText />
            {t("export.allPdf")}
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => handleAll("png")}>
            <FileImage />
            {t("export.allPng")}
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => handleAll("b18")}>
            <Box />
            {t("export.b18")}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => setOptions(true)}>
            <Settings2 />
            {t("export.options")}
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
