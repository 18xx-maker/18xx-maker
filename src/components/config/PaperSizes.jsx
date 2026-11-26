import { assocPath } from "ramda";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

import { useConfig } from "@/hooks";

// Config dimensions are in 1/100 inch
const INCH = 100;
const MM = 3.937007874;

export const paperSizes = [
  { name: "Letter", width: 8.5 * INCH, height: 11 * INCH },
  { name: "Legal", width: 8.5 * INCH, height: 14 * INCH },
  { name: "Tabloid", width: 11 * INCH, height: 17 * INCH },
  { name: "A5", width: 148 * MM, height: 210 * MM },
  { name: "A4", width: 210 * MM, height: 297 * MM },
  { name: "A3", width: 297 * MM, height: 420 * MM },
];

const same = (a, b) => Math.abs(a - b) < 0.01;

// Buttons that set the paper width and height to a standard size
const PaperSizes = ({ label }) => {
  const { config, userLayerConfig, setConfig } = useConfig();
  const { width, height } = config.paper || {};

  const apply = ({ width, height }) =>
    setConfig(
      assocPath(
        ["paper", "height"],
        height,
        assocPath(["paper", "width"], width, userLayerConfig),
      ),
    );

  return (
    <div className="flex flex-col gap-2">
      <Label className="text-lg">{label}</Label>
      <div
        className="flex flex-row flex-wrap gap-2"
        role="group"
        aria-label={label}
      >
        {paperSizes.map((size) => (
          <Button
            key={size.name}
            type="button"
            size="sm"
            variant={
              same(width, size.width) && same(height, size.height)
                ? "default"
                : "outline"
            }
            onClick={() => apply(size)}
          >
            {size.name}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default PaperSizes;
