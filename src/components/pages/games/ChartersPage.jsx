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

import GameCharter, { CharterSpacer } from "@/components/GameCharter";
import Pins from "@/components/Pins";
import charterCss from "@/components/charterCss";
import PageSetup from "@/components/page/PageSetup";
import Svg from "@/components/svg/Svg";

import { useConfig, useGame } from "@/hooks";
import { Redirect } from "@/router";
import { getCharterData, layoutPaper } from "@/util";
import {
  compileCompanies,
  overrideCompanies,
} from "@/util/companies/companies";

const isMinor = prop("minor");
const isMajor = compose(not, prop("minor"));

const ChartersPage = () => {
  const { config } = useConfig();
  const charters = config.charters;
  const paper = layoutPaper(config.paper, config.printScale);
  const override = config.overrideCompanies;
  const selection = config.overrideSelection;
  const game = useGame();

  if (!game.companies) {
    return <Redirect to={`/games/${game.meta.slug}/`} replace />;
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

  // Full width charters in the free layout are a row each, so a spacer would
  // only be a blank charter. Half width ones pair up and the spacer ends the row.
  let freePadding = charters.halfWidth ? padding : 0;
  let companies = concat(majors, concat(repeat(null, freePadding), minors));

  let pages;
  if (data.layout === "free") {
    // No pages, easy
    pages = addIndex(chain)(
      (company, index) =>
        company ? (
          <GameCharter
            key={`${index}-${company.abbrev}`}
            company={company}
            game={game}
            charters={charters}
          />
        ) : (
          <CharterSpacer
            key={`spacer-free-${index}`}
            halfWidth={charters.halfWidth}
          />
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
                <GameCharter
                  key={`${index}-${company.abbrev}`}
                  company={company}
                  game={game}
                  charters={charters}
                />
              ) : (
                <CharterSpacer
                  key={`spacer-major-${index}`}
                  halfWidth={charters.halfWidth}
                />
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
              <GameCharter
                key={`${index}-${company.abbrev}`}
                company={company}
                game={game}
                charters={charters}
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
    <div
      className="charters"
      data-testid={`game-${game.meta.slug}-charters`}
      data-layout={charters.layout}
      data-per-page={data.perPage}
    >
      <style>
        {charterCss(
          data,
          gameCompanies.some((c) => c.banner),
        )}
      </style>
      {pages}
      <PageSetup landscape={false} />
    </div>
  );
};

export default ChartersPage;
