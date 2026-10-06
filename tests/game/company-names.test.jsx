import { screen } from "@testing-library/react";

import { renderApp } from "@tests/support/helpers.jsx";
import { all, one } from "@tests/support/render.jsx";

// The name and the second line of every charter or share card in a root
const charterTexts = (root) =>
  all(root, ".charter__name").map((n) => [
    n.children[0].textContent,
    n.children[1]?.textContent,
  ]);
const shareTexts = (root) =>
  all(root, ".card__body").map((b) => [
    one(b, ".share__name")?.textContent.trim(),
    one(b, ".share__subtext")?.textContent,
  ]);

// BLRR has an alias, LBRR an alias and a subtext, NVRR a blank alias
const expected = {
  name: {
    blrr: ["Black Railroad", undefined],
    lbrr: ["Light Blue Railroad", "Light Blue Override"],
    nvrr: ["Navy Railroad", undefined],
  },
  alias: {
    blrr: ["Black Rail", undefined],
    lbrr: ["Sky Blue Line", "Light Blue Override"],
    nvrr: ["Navy Railroad", undefined],
  },
  both: {
    blrr: ["Black Railroad", "Black Rail"],
    lbrr: ["Light Blue Railroad", "Sky Blue Line"],
    nvrr: ["Navy Railroad", undefined],
  },
};

describe("company names", () => {
  it.each(["name", "alias", "both"])(
    "prints the %s on the charters",
    async (mode) => {
      renderApp(
        `/games/18Test/charters?config.charters.layout=free&config.companyNames=${mode}`,
      );
      const root = await screen.findByTestId("game-18Test-charters");
      const texts = charterTexts(root);
      expect(texts[0]).toEqual(expected[mode].blrr);
      expect(texts[1]).toEqual(expected[mode].lbrr);
      expect(texts[3]).toEqual(expected[mode].nvrr);
    },
  );

  it.each(["name", "alias", "both"])(
    "prints the %s on the paged charters",
    async (mode) => {
      renderApp(
        `/games/18Test/charters?config.charters.layout=3x1&config.companyNames=${mode}`,
      );
      const root = await screen.findByTestId("game-18Test-charters");
      expect(charterTexts(root)[0]).toEqual(expected[mode].blrr);
    },
  );

  it.each(["name", "alias", "both"])(
    "prints the %s on a single charter",
    async (mode) => {
      renderApp(`/games/18Test/charters/0?config.companyNames=${mode}`);
      const root = await screen.findByTestId("game-18Test-charter");
      expect(charterTexts(root)[0]).toEqual(expected[mode].blrr);
    },
  );

  it.each([
    ["name", ["Light Blue Railroad", undefined]],
    ["alias", ["Sky Blue Line", undefined]],
    ["both", ["Light Blue Railroad", "Sky Blue Line"]],
  ])(
    "prints no company subtext on a single charter in %s",
    async (mode, exp) => {
      renderApp(`/games/18Test/charters/1?config.companyNames=${mode}`);
      const root = await screen.findByTestId("game-18Test-charter");
      expect(charterTexts(root)[0]).toEqual(exp);
    },
  );

  it.each(["name", "alias", "both"])(
    "prints the %s on the share cards",
    async (mode) => {
      renderApp(`/games/18Test/cards?config.companyNames=${mode}`);
      const root = await screen.findByTestId("game-18Test-cards");
      expect(shareTexts(root)).toContainEqual(expected[mode].blrr);
    },
  );

  it.each(["name", "alias", "both"])(
    "prints the %s on a single share card",
    async (mode) => {
      renderApp(`/games/18Test/cards/share/0?config.companyNames=${mode}`);
      const root = await screen.findByTestId("game-18Test-card");
      expect(shareTexts(root)[0]).toEqual(expected[mode].blrr);
    },
  );
});
