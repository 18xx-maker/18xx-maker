import { useTranslation } from "react-i18next";

import { TriangleAlert } from "lucide-react";

import Item from "@/components/nav/sidebar/Item";

// The menu entry of a game with problems, with how many there are
const ProblemsItem = ({ slug, count }) => {
  const { t } = useTranslation();

  return (
    <Item
      to={`/games/${slug}/problems`}
      icon={TriangleAlert}
      label={t("problems.nav")}
      badge={count}
    />
  );
};

export default ProblemsItem;
