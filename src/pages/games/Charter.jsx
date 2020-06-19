import React, { useContext } from "react";
import ConfigContext from "../../context/ConfigContext";
import GameContext from "../../context/GameContext";

import { Redirect, useParams } from "react-router-dom";
import { getCharterData, compileCompanies, overrideCompanies } from "../../util";
import Charter from "../../Charter";

import PageSetup from "../../PageSetup";

const Charters = () => {
  const { config } = useContext(ConfigContext);
  const charters = config.charters;
  const paper = config.paper;
  const override = config.overrideCompanies;
  const selection = config.overrideSelection;
  const { game } = useContext(GameContext);
  const { index } = useParams();

  if (!game.companies) {
    return <Redirect to={`/games/${game.slug}/`} />;
  }

  let gameCompanies = overrideCompanies(compileCompanies(game), override, selection);
  charters["cutlines"] = 0;
  charters["bleed"] = 0;
  charters["border"] = 0;
  let data = getCharterData(charters, paper);
  let company = gameCompanies[index];

  let css = `
.cutlines {
    padding: ${data.css.cutlines};
    width: ${data.css.totalWidth};
    height: ${data.css.totalHeight};
}

.cutlines--minor {
    height: ${data.css.totalMinorHeight};
}

.cutlines--half {
    width: ${data.css.totalHalfWidth};
}

.cutlines:after,
.cutlines:before {
    width: ${data.css.cutlines};
    height: ${data.css.height};
    top: ${data.css.cutlinesAndBleed};
}

.cutlines--minor:after,
.cutlines--minor:before {
    height: ${data.css.minorHeight};
}

.cutlines--half:after,
.cutlines--half:before {
    width: ${data.css.halfWidth};
}

.cutlines > div:after,
.cutlines > div:before {
    width: ${data.css.width};
    height: ${data.css.cutlines};
    left: ${data.css.bleed};
}

.cutlines > div:after {
    bottom: -${data.css.cutlines};
}

.cutlines > div:before {
    top: -${data.css.cutlines};
}

.cutlines--half > div:before,
.cutlines--half > div:after {
    width: ${data.css.halfWidth};
}

.charter,
.charter__bleed {
    height: ${data.css.bleedHeight};
    width: ${data.css.bleedWidth};
}

.charter--minor,
.charter--minor .charter__bleed {
    height: ${data.css.bleedMinorHeight};
}

.charter--half,
.charter--half .charter__bleed {
    width: ${data.css.bleedHalfWidth};
}

.charter__body {
    border: ${data.border}px solid black;
    margin: ${data.css.bleed};
    width: ${data.css.width};
    height: ${data.css.height};
}

.charter--minor .charter__body {
    height: ${data.css.minorHeight};
}

.charter--half .charter__body {
    width: ${data.css.halfWidth};
}

.charter--color .charter__hr {
    height: calc(1.0625in + ${data.css.bleed});
}
.charter--color.charter--minor .charter__hr {
    height: calc(0.875in + ${data.css.bleed});
}

.charter--carth .charter__hr {
    top: calc(1.125in + ${data.css.bleed});
}

.charter--carth.harter--minor .charter__hr,
.charter--carth.charter--half .charter__hr {
    top: calc(0.875in + ${data.css.bleed});
}
`;

  return (
    <div className="charters printElement" style={{display: 'inline-block'}}>
      <style>{css}</style>
      <Charter
        game={game.info.title}
        name={company.name}
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
      />
      <PageSetup landscape={false}/>
    </div>
  );
};

export default Charters;
