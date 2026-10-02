#!/usr/bin/env node
import { userInfo } from "node:os";

import { CommanderError, program } from "commander";

import b18 from "#cli/b18";
import compile from "#cli/compile-schemas";
import config from "#cli/config";
import exportCommand from "#cli/exportCommand";
import print from "#cli/print";
import { UsageError } from "#cli/util";
import validate from "#cli/validate";
import version from "#cli/version";

const { username } = userInfo();

program.version(version);
// Throw instead of exiting so every failure gets an exit code below
program.exitOverride();
const configCommand = program
  .command("config")
  .description("set or inspect 18xx Maker CLI options");
configCommand
  .command("list", { isDefault: true })
  .description("list all config values")
  .action(config.commands.list);
configCommand
  .command("file")
  .description("print the file where your config is stored")
  .action(config.commands.file);
configCommand
  .command("get")
  .description("get the value of a config setting")
  .argument("<key>", "the config setting to display")
  .option("-r, --raw", "output only the value")
  .action(config.commands.get);
configCommand
  .command("set")
  .description("set the value of a config setting")
  .argument("<key>", "the config setting to set")
  .argument("[value]", "the value to set, removes the setting if left blank")
  .action(config.commands.set);

// Add in commands
const compileCommand = program
  .command("compile")
  .description("compile 18xx Maker assets");
compileCommand.command("schemas", { isDefault: true }).action(compile);

program
  .command("validate")
  .description("validate any 18xx Maker json file")
  .arguments("<files...>")
  .action(validate);

program
  .command("export")
  .description("export PDF, PNG and Board 18 files of a game")
  .argument("[game]", "the id of a bundled game or the path of a game file")
  .option(
    "-f, --format <formats>",
    "pdf, png and b18, separated by commas",
    "pdf",
  )
  .option("--docs <pages>", "only these pages: map,tiles,cards,...")
  .option("--layouts <layouts>", "all: a file for every layout of a sheet")
  .option("--paginated", "also export the paginated pdfs")
  .option("--variation <n>", "only this map variation")
  .option("--config <file>", "a config file to export with")
  .option("--dpi <dpi>", "the resolution of the PNG files, 1 to 300", "300")
  .option("-o, --out <folder>", "the folder for the game folders", "render")
  .option("-j, --jobs <n>", "how many files to capture at the same time", "1")
  .option("-a, --all", "export all bundled games")
  .option(
    "--b18-version <version>",
    "the Board 18 version of the game box",
    "1.0",
  )
  .option(
    "--b18-author <author>",
    "the author of the Board 18 game box",
    config.get("b18.author") || username,
  )
  .option("-d, --debug", "start the express server and then quit")
  .action(exportCommand);

program
  .command("b18")
  .description("create a Board 18 game box from a bundled game (maker export)")
  .argument("<game>", "the id of the game to create a Board 18 box for")
  .argument("<version>", "the Board 18 version string for the game box")
  .argument(
    "[author]",
    "the author of this game box",
    config.get("b18.author") || username,
  )
  .option("-d, --debug", "start the express server and then quit")
  .action(b18);

program
  .command("print")
  .description(
    "print the PDF assets for a bundled 18xx Maker game (maker export)",
  )
  .argument("[game]", "the id of the game to print", "1889")
  .option("-a, --all", "print all games")
  .option("-d, --debug", "start the express server and then quit")
  .action(print);

// Parse the arguments and away we go! Exit codes: 0 ok, 1 some documents
// failed (the commands set process.exitCode), 2 usage error or site not built
try {
  await program.parseAsync();
} catch (err) {
  if (err instanceof CommanderError) {
    // Commander already printed the message
    process.exitCode = err.exitCode === 0 ? 0 : 2;
  } else if (err instanceof UsageError) {
    console.error(err.message);
    process.exitCode = 2;
  } else {
    console.error(err);
    process.exitCode = 1;
  }
}
