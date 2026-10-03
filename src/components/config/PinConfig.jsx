import { useTranslation } from "react-i18next";

import { Separator } from "@/components/ui/separator";

import Input from "@/components/config/Input";

const PinConfig = ({ prefix }) => {
  const { t } = useTranslation();
  const field = (name) => ({
    name: `${prefix}.pins.${name}`,
    label: t(`config.pins.${name}.label`),
    description: t(`config.pins.${name}.description`),
    dimension: true,
  });

  return (
    <div className="flex flex-col gap-6">
      <Separator orientation="horizontal" />
      <div className="flex flex-row flex-wrap gap-6 *:flex-1 *:min-w-40">
        <Input {...field("innerRadius")} />
        <Input {...field("outerRadius")} />
      </div>
      <div className="flex flex-row flex-wrap gap-6 *:flex-1 *:min-w-40">
        <Input {...field("x1")} />
        <Input {...field("x2")} />
      </div>
      <Input {...field("y")} />
    </div>
  );
};
export default PinConfig;
