#!/usr/bin/env node
import { userInfo } from "node:os";

import { program } from "commander";

import b18 from "#cli/b18";
import compile from "#cli/compile-schemas";
import config from "#cli/config";
import print from "#cli/print";
import validate from "#cli/validate";
import version from "#util/version";

const { username } = userInfo();

program.version(version);
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
  .command("b18")
  .description("create a Board 18 game box from a bundled 18xx Maker game")
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
  .description("print the PDF assets for a bundled 18xx Maker game")
  .argument("[game]", "the id of the game to print", "1889")
  .option("-a, --all", "print all games")
  .option("-d, --debug", "start the express server and then quit")
  .action(print);

// Parse the arguments and away we go!
program.parse();
