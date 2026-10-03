import { Separator } from "@/components/ui/separator";

import Input from "@/components/config/Input";

const PinConfig = ({ prefix }) => (
  <div className="flex flex-col gap-6">
    <Separator orientation="horizontal" />
    <div className="flex flex-row flex-wrap gap-6 *:flex-1 *:min-w-40">
      <Input
        name={`${prefix}.pins.innerRadius`}
        label="Pins Inner Radius"
        dimension={true}
        description="How big should the inner radius of the pin markers be."
      />
      <Input
        name={`${prefix}.pins.outerRadius`}
        label="Pins Outer Radius"
        dimension={true}
        description="How big should the outer radius of the pin markers be."
      />
    </div>
    <div className="flex flex-row flex-wrap gap-6 *:flex-1 *:min-w-40">
      <Input
        name={`${prefix}.pins.x1`}
        label="Pins X1 Location"
        dimension={true}
        description="How far from the edge of the paper should the first pin be placed."
      />
      <Input
        name={`${prefix}.pins.x2`}
        label="Pins X2 Location"
        dimension={true}
        description="How far from the edge of the paper should the second pin be placed."
      />
    </div>
    <Input
      name={`${prefix}.pins.y`}
      label="Pin Y Location"
      dimension={true}
      description="How far from the edge of the paper should both pins be placed."
    />
  </div>
);
export default PinConfig;
