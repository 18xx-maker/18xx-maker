import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";

import { Images } from "lucide-react";

import { Button } from "@/components/ui/button";

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
    <Button
      variant="outline"
      aria-haspopup="menu"
      {...{ [EXPORT_TRIGGER]: "" }}
      onClick={() => dispatch(createSetExportMenuOpen(true))}
      className="border rounded-sm px-2 h-8 m-0 shrink-0 print:hidden"
    >
      <Images className="size-6" />
      <span className="max-md:sr-only">{t("export.label")}</span>
    </Button>
  );
};

export default ExportButton;
