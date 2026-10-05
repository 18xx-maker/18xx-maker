import { useTranslation } from "react-i18next";

import { FileDiff } from "lucide-react";

import Item from "@/components/nav/sidebar/Item";

// The menu entry of a game with unsaved edits, with how many fields changed
const ChangesItem = ({ slug, count }) => {
  const { t } = useTranslation();

  return (
    <Item
      to={`/games/${slug}/changes`}
      icon={FileDiff}
      label={t("changes.nav")}
      badge={count}
    />
  );
};

export default ChangesItem;
