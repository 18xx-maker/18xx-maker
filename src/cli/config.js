import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import chalk from "chalk";
import envPaths from "env-paths";

import { compose, forEach, length, map, max, prop, reduce } from "ramda";

const SETTINGS = [
  {
    key: "b18.author",
    description: "The default author name to use with b18 boxes",
  },
];
const MAX_KEY_LENGTH = reduce(
  max,
  0,
  map(compose(length, prop("key")), SETTINGS),
);
const CONFIG_FILENAME = "config.json";
const WRITE_OPTIONS = { encoding: "utf-8", mode: "644" };
const configDirectory = envPaths("18xx-maker-cli", { suffix: "" }).config;
const configFile = join(configDirectory, CONFIG_FILENAME);

// Make sure directory is created
mkdirSync(configDirectory, { recursive: true, mode: "755" });

if (!existsSync(configFile)) {
  writeFileSync(configFile, "{}", WRITE_OPTIONS);
}

// Read in config file
const config = JSON.parse(readFileSync(configFile, "utf-8"));

// Save config file
const save = () => {
  writeFileSync(configFile, JSON.stringify(config, null, 2), "utf-8");
};

const outValue = (value) =>
  value ? chalk.cyan(value) : chalk.gray.italic("Not Set");
const outKey = chalk.white;
const out = (key) => console.log(outKey(key) + ": " + outValue(get(key)));
const get = (key) => (key ? prop(key, config) : config);
const getCommand = (key, opts) => (opts.raw ? console.log(get(key)) : out(key));
const set = (key, value) => {
  if (value) {
    config[key] = value;
  } else {
    delete config[key];
  }
  save();
};
const setCommand = (key, value) => {
  set(key, value);
  out(key);
};

const list = () => {
  forEach((setting) => {
    const value = get(setting.key);
    console.log(
      outKey(setting.key.padEnd(MAX_KEY_LENGTH + 1, " ")) +
        (value ? outValue(value) : chalk.gray.italic("Not Set")),
    );
    console.log(chalk.gray.italic(setting.description) + "\n");
  }, SETTINGS);
};

const file = () => {
  console.log(configFile);
};

export default {
  commands: { list, file, get: getCommand, set: setCommand },
  get,
  set,
};
