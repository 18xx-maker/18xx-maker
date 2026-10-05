import { useTranslation } from "react-i18next";

import { History } from "lucide-react";

import Item from "@/components/nav/sidebar/Item";

// The menu entry of a game that was saved in this session
const HistoryItem = ({ slug }) => {
  const { t } = useTranslation();

  return (
    <Item
      to={`/games/${slug}/history`}
      icon={History}
      label={t("history.nav")}
    />
  );
};

export default HistoryItem;
