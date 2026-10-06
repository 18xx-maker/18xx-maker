import Charter from "@/components/Charter";

import { useConfig } from "@/hooks";
import { companyNames } from "@/util/companies/companyNames";
import { charterHalfWidth } from "@/util/companies/companyTrains";

// A charter of a game company, with the game's fonts as the default.
// withSubtext false drops the company's own subtext (the single charter page
// never printed it); the alias of the "both" mode still shows.
const GameCharter = ({
  company,
  game,
  charters,
  withSubtext = true,
  ...rest
}) => {
  const { config } = useConfig();
  const names = companyNames(
    withSubtext ? company : { ...company, subtext: undefined },
    config.companyNames,
  );

  return (
    <Charter
      game={game.info.title}
      abbrev={company.abbrev}
      logo={company.logo}
      color={company.color}
      token={company.token}
      tokens={company.tokens}
      phases={game.phases}
      turns={game.turns}
      trains={game.trains}
      minor={!!company.minor}
      company={company}
      variant={company.variant}
      fontFamily={company.fontFamily || game.info.companyFontFamily}
      fontSize={company.fontSize || game.info.companyFontSize}
      fontWeight={company.fontWeight || game.info.companyFontWeight}
      fontStyle={company.fontStyle || game.info.companyFontStyle}
      halfWidth={charterHalfWidth(charters, !!company.minor)}
      {...rest}
      name={names.name}
      subtext={names.subtext}
    />
  );
};

// An empty place on a sheet, so that a row of charters stays full
export const CharterSpacer = ({ halfWidth }) => (
  <div className={`cutlines${halfWidth ? " cutlines--half" : ""}`}>
    <div className={`charter${halfWidth ? " charter--half" : ""}`}></div>
  </div>
);

export default GameCharter;
