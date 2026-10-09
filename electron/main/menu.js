import { Menu, app } from "electron";

import { getRecents } from "./config.js";
import { openGame } from "./game.js";
import {
  buildTemplate,
  createT,
  menuLanguage,
  nextLanguage,
} from "./menuTemplate.js";
import { send } from "./util.js";

const isMac = process.platform === "darwin";

// The language of the menu: the app's own setting, sent by the page, else the
// system's (read when the menu is first set, the locale is known once the app
// is ready)
let language;

const openGameAndRedirect = () =>
  openGame()
    .then((slug) => slug && send("redirect", `/games/${slug}/map`))
    .catch((e) => send("alert", "Error", e.message, "error"));

export const setMenu = () => {
  language ??= menuLanguage(app.getLocale()) ?? "en";
  const template = buildTemplate({
    isMac,
    appName: app.name,
    recents: getRecents(),
    t: createT(language),
    send,
    open: openGameAndRedirect,
  });

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
};

// A language the menu does not have is English
export const setMenuLanguage = (tag) => {
  const next = nextLanguage(language, tag);
  if (!next) return;
  language = next;
  setMenu();
};
