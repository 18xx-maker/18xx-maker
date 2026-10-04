import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";

import { Images } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { EXPORT_TRIGGER } from "@/components/ExportHost";

import { createSetExportMenuOpen } from "@/state";
import { useBooleanParam } from "@/util/query";

// The toolbar button of the edit pages. The menu itself is ExportHost, which
// the app hosts once for every page.
const ExportButton = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [print] = useBooleanParam("print");

  if (print) {
    return null;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            aria-label={t("export.label")}
            aria-haspopup="menu"
            {...{ [EXPORT_TRIGGER]: "" }}
            onClick={() => dispatch(createSetExportMenuOpen(true))}
            className="border rounded-sm p-2 w-8 h-8 m-0 print:hidden"
          >
            <Images className="size-6" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>{t("export.label")}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default ExportButton;
