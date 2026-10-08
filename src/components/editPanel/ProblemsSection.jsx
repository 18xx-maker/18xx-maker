import { useCallback } from "react";

import ProblemsList from "@/components/problems/ProblemsList";

import { useLocation } from "@/router";
import { jsonLineSearch } from "@/util/query";

// The problems of the game (the list of the problems page): a row opens the
// JSON tab on its line, on the page the panel is on
const ProblemsSection = ({ game }) => {
  const { search } = useLocation();
  const linkTo = useCallback(
    (line) => ({ search: jsonLineSearch(search, line) }),
    [search],
  );

  return (
    <div>
      <ProblemsList
        game={game}
        linkTo={linkTo}
        className="px-4 border rounded-xl"
      />
    </div>
  );
};

export default ProblemsSection;
