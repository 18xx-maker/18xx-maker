import { useLocation, useParams } from "react-router";

import { assoc, flatten, map } from "ramda";

import Number from "@/components/cards/Number";
import Private from "@/components/cards/Private";
import Share from "@/components/cards/Share";
import Train from "@/components/cards/Train";

import { MAX_CARD_BLEED } from "@/export/options.js";
import { useConfig, useGame } from "@/hooks";
import {
  compileCompanies,
  overrideCompanies,
} from "@/util/companies/companies";
import { companyNames } from "@/util/companies/companyNames";
import { cardCompanyTrains } from "@/util/companies/companyTrains";
import { getSingleCardData } from "@/util/sizes";

const CardPage = () => {
  const { config } = useConfig();
  const game = useGame();
  const { type, index } = useParams();

  // The bleed of the image (in units) the export asks for, none by default
  const { search } = useLocation();
  const requested = parseFloat(new URLSearchParams(search).get("cardBleed"));
  const bleed = requested > 0 ? Math.min(requested, MAX_CARD_BLEED) : 0;

  // Anything that is not a private, share or train is a number card
  const cardType = ["private", "share", "train"].includes(type)
    ? type
    : "number";

  let node;
  switch (type) {
    case "private":
      node = <Private players={game.players} {...game.privates[index]} />;
      break;
    case "train": {
      const trains = [
        ...(game.trains || []),
        ...cardCompanyTrains(
          overrideCompanies(
            compileCompanies(game),
            config.overrideCompanies,
            config.overrideSelection,
          ),
          config.charters,
          game.trains,
        ),
      ];
      node = <Train train={trains[index]} trains={trains} />;
      break;
    }
    case "share": {
      const override = config.overrideCompanies;
      const selection = config.overrideSelection;
      let companies =
        overrideCompanies(compileCompanies(game), override, selection) || [];
      let shares = flatten(
        map(
          (c) => map((s) => assoc("company", c, s), c.shares || []),
          companies,
        ),
      );

      let share = shares[index];
      let company = share.company;
      let names = companyNames(company, config.companyNames, share.subtext);
      node = (
        <Share
          abbrev={company.abbrev}
          logo={company.logo}
          color={company.color}
          token={company.token || company.color}
          {...share}
          name={names.name}
          subtext={names.subtext}
          variant={company.variant || share.variant}
          fontFamily={company.fontFamily || game.info.companyFontFamily}
        />
      );
      break;
    }
    default:
      // Make a number card from this number
      node = <Number number={index} background={game.info.background} />;
      break;
  }

  let data = getSingleCardData(config.cards, config.paper, cardType, bleed);

  let css = `
.cutlines {
    padding: ${data.css.cutlines};
    width: ${data.css.totalWidth};
    height: ${data.css.totalHeight};
}

.cutlines:after,
.cutlines:before {
    width: ${data.css.cutlines};
    height: ${data.css.height};
    top: ${data.css.cutlinesAndBleed};
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

.card,
.card__bleed {
    height: ${data.css.bleedHeight};
    width: ${data.css.bleedWidth};
}

.card__body {
    border: ${data.border}px solid black;
    margin: ${data.css.bleed};
    width: ${data.css.width};
    height: ${data.css.height};
}

.private__revenue--background::before {
    right: -${data.css.bleed};
    bottom: -${data.css.bleed};
}

.share__hr {
    bottom: calc(0.375in + ${data.css.bleed});
}

.share--left .share__hr {
    left: calc(0.2025in + ${data.css.bleed});
}

.share--gmt .share__hr {
    width: calc(0.67in + ${data.css.bleed});
}

.train__hr {
    height: calc(0.6875in + ${data.css.bleed});
}
`;

  return (
    <div>
      <style>{css}</style>
      <div
        className="printElement"
        data-testid={`game-${game.meta.slug}-card`}
        style={{ overflow: "auto", display: "inline-block" }}
      >
        {node}
      </div>
    </div>
  );
};

export default CardPage;
