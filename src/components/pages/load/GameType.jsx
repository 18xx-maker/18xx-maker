import { useTranslation } from "react-i18next";

import { HardDrive, Package } from "lucide-react";

import { Badge } from "@/components/ui/badge";

const GameType = ({ type, ...pass }) => {
  const { t } = useTranslation();
  const label =
    type === "bundled"
      ? t("game.type.bundled.label")
      : t("game.type.system.label");
  const icon =
    type === "bundled" ? (
      <Package className="w-3 h-3 mr-1" />
    ) : (
      <HardDrive className="w-3 h-3 mr-1" />
    );
  return (
    <Badge variant="outline" {...pass}>
      {icon} {label}
    </Badge>
  );
};

export default GameType;
