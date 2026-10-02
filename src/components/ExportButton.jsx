import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import { useLocation, useMatch } from "react-router";

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
import { planExport, planSingle } from "@/util/exportPlan";
import { useBooleanParam } from "@/util/query";

const ExportButton = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const location = useLocation();
  const game = useGame();
  const { defaultConfig, userConfig, storedConfig } = useConfig();
  const layers = { defaultConfig, userConfig, storedConfig };
  const [options, setOptions] = useState(false);
  const [print] = useBooleanParam("print");

  const match = useMatch("/games/:slug/*");
  const notOnGames = !match || match.params["*"] === "";

  if (notOnGames || print || !game) {
    return null;
  }

  // The result, and progress, come as alerts from the main process
  const exportFiles = (request) =>
    window.api.export(request).catch((error) => {
      dispatch(createAlert(t("export.failed"), error.message, "error"));
    });

  const handleAll = (format) => {
    trackEvent("exportGame", location, { media: format });
    exportFiles(
      planExport(game, layers, {
        formats: [format],
        b18: { version: "1.0", author: game.info.designer || "18xx Maker" },
      }),
    );
  };

  const handleSingle = (format) => {
    trackEvent("exportComponent", location, { media: format });
    exportFiles(planSingle(game, layers, location, format));
  };

  return (
    <>
      <DropdownMenu>
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
        <DropdownMenuContent align="end">
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
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => handleSingle("pdf")}>
            <FileText />
            {t("export.singlePdf")}
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => handleSingle("png")}>
            <FileImage />
            {t("export.singlePng")}
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
