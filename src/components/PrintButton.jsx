import { useMatch } from "react-router";

import { Printer } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { useGame } from "@/hooks";
import { useBooleanParam } from "@/util/query";

const PrintButton = () => {
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
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            aria-label="print"
            className="border rounded-sm p-2 w-8 h-8 m-0 print:hidden"
            onClick={handler}
          >
            <Printer className="size-6" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Print</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default PrintButton;
