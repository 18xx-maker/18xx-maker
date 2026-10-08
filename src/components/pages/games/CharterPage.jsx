import GameCharter from "@/components/GameCharter";
import charterCss from "@/components/charterCss";
import PageSetup from "@/components/page/PageSetup";

import { useConfig, useGame } from "@/hooks";
import { Redirect, useParams } from "@/router";
import {
  compileCompanies,
  overrideCompanies,
} from "@/util/companies/companies";
import { getSingleCharterData } from "@/util/sizes";

const CharterPage = () => {
  const { config } = useConfig();
  const charters = config.charters;
  const paper = config.paper;
  const override = config.overrideCompanies;
  const selection = config.overrideSelection;
  const game = useGame();
  const { index } = useParams();

  if (!game.companies) {
    return <Redirect to={`/games/${game.meta.slug}/`} replace />;
  }

  let gameCompanies = overrideCompanies(
    compileCompanies(game),
    override,
    selection,
  );
  let data = getSingleCharterData(charters, paper);
  let company = gameCompanies[index];

  return (
    <div
      className="charters printElement"
      data-testid={`game-${game.meta.slug}-charter`}
      style={{ display: "inline-block" }}
    >
      <style>{charterCss(data, !!company?.banner)}</style>
      <GameCharter
        company={company}
        game={game}
        charters={charters}
        withSubtext={false}
      />
      <PageSetup landscape={false} />
    </div>
  );
};

export default CharterPage;
