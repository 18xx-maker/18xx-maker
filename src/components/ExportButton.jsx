import { useTranslation } from "react-i18next";
import { useLocation, useMatch } from "react-router";

import { Box, FileImage, FileText, Images } from "lucide-react";

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

import { useConfig, useGame } from "@/hooks";
import { trackEvent } from "@/util/analytics";
import { planB18, planExport } from "@/util/exportPlan";
import { useBooleanParam } from "@/util/query";

const ExportButton = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const game = useGame();
  const { config } = useConfig();
  const [print] = useBooleanParam("print");

  const match = useMatch("/games/:slug/*");
  const notOnGames = !match || match.params["*"] === "";

  if (notOnGames || print || !game) {
    return null;
  }

  const handleAllPdf = () => {
    trackEvent("exportGame", location, { media: "pdf" });
    window.api.exportPDF(game.meta.slug, planExport(game, config, "pdf"));
  };

  const handleAllPng = () => {
    trackEvent("exportGame", location, { media: "png" });
    window.api.exportPNG(game.meta.slug, planExport(game, config, "png"));
  };

  const handleB18 = () => {
    trackEvent("exportGame", location, { media: "b18" });
    window.api.exportB18(
      planB18(game, config, {
        version: "1.0",
        author: game.info.designer || "18xx Maker",
      }),
    );
  };

  const handleSinglePdf = () => {
    trackEvent("exportComponent", location, { media: "pdf" });
    window.api.pdf(location.pathname + location.search);
  };

  const handleSinglePng = () => {
    trackEvent("exportComponent", location, { media: "png" });
    window.api.png(location.pathname + location.search);
  };

  return (
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
        <DropdownMenuItem onSelect={handleAllPdf}>
          <FileText />
          {t("export.allPdf")}
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={handleAllPng}>
          <FileImage />
          {t("export.allPng")}
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={handleB18}>
          <Box />
          {t("export.b18")}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={handleSinglePdf}>
          <FileText />
          {t("export.singlePdf")}
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={handleSinglePng}>
          <FileImage />
          {t("export.singlePng")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ExportButton;
