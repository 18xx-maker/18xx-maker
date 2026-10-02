import { existsSync, readdirSync } from "node:fs";

import { compose, filter, map } from "ramda";

import {
  exportGame,
  loadExportData,
  loadGameConfig,
  reportFailures,
  withBrowser,
} from "#cli/export";
import { UsageError, loadGame, setup, startExpress } from "#cli/util";
import { documents } from "#export/documents";
import { exportJobs } from "#export/names";

const command = async (game, opts) => {
  // Setup folders
  setup();

  if (opts.debug) {
    startExpress();
    console.log("Debug Mode");
    console.log("Starting the express server on http://localhost:9000");
    console.log("\nCtrl-C when done");
    return;
  }

  let games = [game];
  if (opts.all) {
    // Read all games from directory
    const gameFiles = readdirSync("./src/data/games");
    games = compose(
      map((name) => name.replace(/\.json$/, "")),
      filter((name) => name.endsWith(".json")),
    )(gameFiles);
  } else {
    // Check if the game exists
    if (!existsSync(`./src/data/games/${games[0]}.json`)) {
      throw new UsageError(`Game ${games[0]} not found`);
    }
  }
  console.log(`Games: ${games.join(", ")}`);

  // Start processing
  const data = loadExportData();
  const failed = [];

  await withBrowser(async (page) => {
    for (const id of games) {
      const gameDef = loadGame(id);
      const docs = documents(gameDef, loadGameConfig(gameDef), {
        ...data,
        slug: id,
      });

      failed.push(
        ...(await exportGame({
          page,
          jobs: exportJobs(gameDef, docs, ["pdf"]),
          out: `render/${id}`,
        })),
      );
    }
  });

  reportFailures(failed);
};

export default command;
