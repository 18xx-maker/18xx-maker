import fs from "node:fs";

import { loadExportData, loadGameConfig } from "#cli/export";
import { loadGame } from "#cli/util";
import { b18Spec } from "#export/b18";
import { documents } from "#export/documents";
import { docPath, exportJobs } from "#export/names";
import legacy from "./__fixtures__/legacy-cli.js";

// legacy-cli.js is what the CLI wrote before the commands were built from
// the export list: the pdf names of print and the b18 box of every bundled
// game. The new output is the same, except for the differences listed here.

const games = fs
  .readdirSync("src/data/games")
  .filter((name) => name.endsWith(".json"))
  .map((name) => name.replace(/\.json$/, ""));

// Files are named after the game title instead of its id
const prefix = (id) =>
  loadGame(id)
    .info.title.toLowerCase()
    .replace(/[^a-z0-9]+/g, "-");

// Documents that did not print before, because the old checks looked for
// different data: tokens used to need companies, 1888 only has extra tokens
const added = { 1888: ["tokens"] };

// Games where the old b18 command crashed, they have no stock market
const crashed = ["1888", "1883ExpressdOrient", "18GJ"];

const data = loadExportData();
const setup = (id) => {
  const game = loadGame(id);
  const config = loadGameConfig(game);
  return { game, config, data: { ...data, slug: id } };
};

describe("print file names", () => {
  it("covers every bundled game", () => {
    expect(games.sort()).toEqual(Object.keys(legacy.print).sort());
  });

  it.each(games)("%s prints what it did, with the new names", (id) => {
    const { game, config, data } = setup(id);
    const names = exportJobs(game, documents(game, config, data), ["pdf"])
      .map((job) => job.path)
      .sort();

    const expected = legacy.print[id]
      .map((name) => name.replace(`${id}-`, `${prefix(id)}-`))
      .concat((added[id] || []).map((doc) => `${prefix(id)}-${doc}.pdf`))
      .sort();
    // A paginated pdf is only there now when its page does not fit on one
    // sheet of paper, print used to have one for every page that has it
    const paginated = (name) => name.includes("-paginated.");
    expect(names.filter((name) => !paginated(name))).toEqual(
      expected.filter((name) => !paginated(name)),
    );
    expect(expected).toEqual(expect.arrayContaining(names.filter(paginated)));
  });

  it("names the seven bundled games whose title is not their id", () => {
    const renamed = [...games]
      .sort()
      .filter((id) => prefix(id) !== id.toLowerCase());
    expect(renamed.map((id) => [id, prefix(id)])).toEqual([
      ["1871BC", "1871-british-columbia"],
      ["1883ExpressdOrient", "1883-express-d-orient"],
      ["1889", "shikoku-1889"],
      ["18GJ", "18-grand-junction"],
      ["18LA", "18-los-angeles"],
      ["18TraXX2020", "18traxx"],
      ["TheOldPrince1871", "the-old-prince-1871"],
    ]);
  });
});

describe("b18 box", () => {
  it.each(games.filter((id) => !crashed.includes(id)))(
    "%s has the json, sizes and file names it had",
    (id) => {
      const { game, config, data } = setup(id);
      const spec = b18Spec(game, config, data, {
        id,
        version: "1.0",
        author: "Pat",
      });
      const old = legacy.b18[id];

      expect(spec.json).toEqual(old.json);
      expect(
        exportJobs(game, spec.images, ["b18"]).map(({ doc, path }) => ({
          path,
          url: `http://localhost:9000${docPath(doc)}`,
          size: {
            width: doc.capture.viewport.w,
            height: doc.capture.viewport.h,
          },
          omitBackground: !doc.capture.background,
        })),
      ).toEqual(old.shots);
    },
  );

  it.each(crashed)("%s has a box now that it crashed before", (id) => {
    expect(legacy.b18[id].error).toBeDefined();
    const { game, config, data } = setup(id);

    const spec = b18Spec(game, config, data, {
      id,
      version: "1.0",
      author: "Pat",
    });

    // No market, no map when the game does not have one
    expect(spec.json.market).toBeUndefined();
    expect(spec.images.map((image) => image.basename)).not.toContain("Market");
    expect(spec.json.tray.map((tray) => tray.type)).toContain("btok");
  });
});
