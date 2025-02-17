import { useNavigate } from "react-router";

import {
  addIndex,
  chain,
  compose,
  concat,
  filter,
  map,
  not,
  prop,
  repeat,
  splitEvery,
} from "ramda";

import Charter from "@/components/Charter";
import PageSetup from "@/components/PageSetup";
import Pins from "@/components/Pins";
import Svg from "@/components/Svg";
import { useConfig, useGame } from "@/hooks";
import { getCharterData } from "@/util";
import { compileCompanies, overrideCompanies } from "@/util/companies";

const isMinor = prop("minor");
const isMajor = compose(not, prop("minor"));

const Charters = () => {
  const navigate = useNavigate();
  const { config } = useConfig();
  const charters = config.charters;
  const paper = config.paper;
  const override = config.overrideCompanies;
  const selection = config.overrideSelection;
  const game = useGame();

  if (!game.companies) {
    navigate(`/games/${game.meta.slug}/`);
  }

  let gameCompanies = overrideCompanies(
    compileCompanies(game),
    override,
    selection,
  );

  // Computer layout data
  let data = getCharterData(charters, paper);
  let majors = filter(isMajor, gameCompanies);
  let minors = filter(isMinor, gameCompanies);

  // Now figure out how many spacers we need
  let leftOver = majors.length % data.perPage;
  let padding = 0;
  if (leftOver > 0) {
    padding = data.perPage - leftOver;
  }

  let companies = concat(majors, concat(repeat(null, padding), minors));

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

.charter--carth.charter--minor .charter__hr,
.charter--carth.charter--half .charter__hr {
    top: calc(0.875in + ${data.css.bleed});
}
`;

  let pages = null;
  if (data.layout === "free") {
    // No pages, easy
    pages = addIndex(chain)(
      (company, index) =>
        company ? (
          <Charter
            game={game.info.title}
            key={`${index}-${company.abbrev}`}
            name={company.name}
            subtext={company.subtext}
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
            halfWidth={charters.halfWidth}
          />
        ) : (
          <div
            key={`spacer-free-${index}`}
            className={`cutlines${charters.halfWidth ? " cutlines--half" : ""}`}
          >
            <div
              className={`charter${charters.halfWidth ? " charter--half" : ""}`}
            ></div>
          </div>
        ),
      companies,
    );
  } else {
    let majorsAndSpacers = concat(majors, repeat(null, padding));
    let splitMajorNodes = splitEvery(data.perPage, majorsAndSpacers);
    let splitMinorNodes = splitEvery(data.minorsPerPage, minors);
    let pins = (
      <Svg
        className="pins"
        viewBox="0 0 750 50"
        style={{ width: "7.5in", height: "0.5in", float: "left" }}
      >
        <Pins config={charters.pins} />
      </Svg>
    );

    let majorPages = addIndex(map)(
      (majorCompanies, index) => (
        <div
          className={`charters charters--${data.layout}`}
          key={`charters-page-${index}`}
          style={{ width: data.css.usableWidth, height: data.css.usableHeight }}
        >
          {pins}
          {addIndex(map)(
            (company, index) =>
              company ? (
                <Charter
                  game={game.info.title}
                  key={`${index}-${company.abbrev}`}
                  name={company.name}
                  subtext={company.subtext}
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
                  halfWidth={data.layout === "3x2"}
                />
              ) : (
                <div
                  key={`spacer-major-${index}`}
                  className={`cutlines${charters.halfWidth ? " cutlines--half" : ""}`}
                >
                  <div
                    className={`charter${charters.halfWidth ? " charter--half" : ""}`}
                  ></div>
                </div>
              ),
            majorCompanies,
          )}
        </div>
      ),
      splitMajorNodes,
    );

    let minorPages = addIndex(map)(
      (minorCompanies, index) => (
        <div
          className={`charters charters--${data.layout}`}
          key={`charters-minors-page-${index}`}
          style={{ width: data.css.usableWidth, height: data.css.usableHeight }}
        >
          {pins}
          {map(
            (company) => (
              <Charter
                game={game.info.title}
                key={`${index}-${company.abbrev}`}
                name={company.name}
                subtext={company.subtext}
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
                halfWidth={data.layout !== "3x1"}
              />
            ),
            minorCompanies,
          )}
        </div>
      ),
      splitMinorNodes,
    );

    pages = concat(majorPages, minorPages);
  }

  return (
    <div className="charters" data-testid={`game-${game.meta.slug}-charters`}>
      <style>{css}</style>
      {pages}
      <PageSetup landscape={false} />
    </div>
  );
};

export default Charters;
