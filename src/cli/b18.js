import { createWriteStream } from "node:fs";

import { ZipArchive } from "archiver";

import {
  createFileSink,
  exportGame,
  loadExportData,
  loadGameConfig,
  reportFailures,
  withBrowser,
} from "#cli/export";
import { loadGame, setup, startExpress } from "#cli/util";
import { b18Spec } from "#export/b18";
import { exportJobs } from "#export/names";

const command = async (bname, version, author, opts) => {
  setup();

  if (opts.debug) {
    startExpress();
    console.log("Debug Mode");
    console.log("Starting the express server on http://localhost:9000");
    console.log("\nCtrl-C when done");
    return;
  }

  const game = loadGame(bname);
  const spec = b18Spec(
    game,
    loadGameConfig(game),
    { ...loadExportData(), slug: bname },
    { id: bname, version, author },
  );
  const out = `render/${bname}`;

  // Output main JSON file
  console.log(`Writing  ${bname}/${spec.names.json}`);
  createFileSink(out).write(
    spec.names.json,
    JSON.stringify(spec.json, null, 2),
  );

  // Output the images
  const failed = await withBrowser((page) =>
    exportGame({ page, jobs: exportJobs(game, spec.images, ["b18"]), out }),
  );

  // Output zip file, and wait for it to be written
  console.log(`Creating ${bname}/${spec.names.zip}`);
  const output = createWriteStream(`${out}/${spec.names.zip}`);
  const archive = new ZipArchive({
    zlib: { level: 9 },
  });
  await new Promise((resolve, reject) => {
    output.on("close", resolve);
    output.on("error", reject);
    archive.on("error", reject);
    archive.pipe(output);
    archive.directory(`${out}/${spec.names.folder}`, spec.names.folder);
    archive.finalize();
  });

  reportFailures(failed);
};
export default command;
