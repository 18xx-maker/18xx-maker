import { useParams } from "react-router";

import { assoc, clone, flatten, map } from "ramda";

import Number from "@/components/cards/Number";
import Private from "@/components/cards/Private";
import Share from "@/components/cards/Share";
import Train from "@/components/cards/Train";
import { useConfig, useGame } from "@/hooks";
import { getCardData } from "@/util/cards";
import { compileCompanies, overrideCompanies } from "@/util/companies";

const Card = () => {
  const { config } = useConfig();
  const game = useGame();
  const { type, index } = useParams();

  let node = null;
  switch (type) {
    case "private":
      node = <Private players={game.players} {...game.privates[index]} />;
      break;
    case "train":
      node = <Train train={game.trains[index]} trains={game.trains} />;
      break;
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
      node = (
        <Share
          name={company.name}
          abbrev={company.abbrev}
          logo={company.logo}
          color={company.color}
          token={company.token || company.color}
          {...share}
          subtext={company.subtext || share.subtext}
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

  let cardConfig = clone(config.cards);
  let paperConfig = clone(config.paper);

  cardConfig.cutlines = 0;
  cardConfig.bleed = 0;
  cardConfig.border = 0;

  switch (config.cards.layout) {
    case "miniEuroDie":
      cardConfig.width = 265.748;
      cardConfig.height = 173.228;

      break;
    case "dtgDie":
      cardConfig.width = 250;
      cardConfig.height = 150;

      break;
    default:
      // No overrides for "free" layout
      break;
  }

  let data = getCardData(cardConfig, paperConfig);

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

export default Card;
