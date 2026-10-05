import { useTranslation } from "react-i18next";
import { useMatch } from "react-router";

import { Printer } from "lucide-react";

import { Button } from "@/components/ui/button";

import KeyLabel from "@/components/KeyLabel";

import { useGame } from "@/hooks";
import { useBooleanParam } from "@/util/query";

const PrintButton = () => {
  const { t } = useTranslation();
  const match = useMatch("/games/*");
  const game = useGame();
  const [print] = useBooleanParam("print");

  if (print || !game || !match) {
    return null;
  }

  const handler = () => {
    window.print();
  };

  return (
    <Button
      variant="outline"
      className="border rounded-sm px-2 h-8 m-0 shrink-0 print:hidden"
      onClick={handler}
    >
      <Printer className="size-6" />
      <span className="max-md:sr-only">
        <KeyLabel text={t("game.print.label")} shortcut="p" />
      </span>
    </Button>
  );
};

export default PrintButton;
