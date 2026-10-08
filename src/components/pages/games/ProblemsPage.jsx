import { useCallback } from "react";
import { useTranslation } from "react-i18next";

import ProblemsList from "@/components/problems/ProblemsList";

import { useGame } from "@/hooks";
import { firstSection } from "@/util/gameNav";
import { formatLines } from "@/util/lineSpec";

// Where the row opens: the JSON editor of the first section with the line of
// the problem selected (none for a draft)
const editorLink = (game, line) => {
  const params = new URLSearchParams({ edit: "true", editSection: "json" });
  if (line) params.set("lines", formatLines([[line, line]]));
  return `/games/${game.meta.slug}/${firstSection(game)}?${params}`;
};

const ProblemsPage = () => {
  const game = useGame();
  const { t } = useTranslation();
  const linkTo = useCallback((line) => editorLink(game, line), [game]);

  return (
    <div className="p-4" data-testid={`game-${game.meta.slug}-problems`}>
      <h1 className="text-4xl font-extrabold">{t("problems.title")}</h1>
      <ProblemsList
        game={game}
        linkTo={linkTo}
        className="px-4 border rounded-xl max-w-3xl"
      />
    </div>
  );
};

export default ProblemsPage;
