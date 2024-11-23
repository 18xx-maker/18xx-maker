import { Menu, app } from "electron";

import { map } from "ramda";

import { getRecents } from "./config.js";
import { openGame } from "./game.js";
import { send } from "./util.js";

const isMac = process.platform === "darwin";

const redirect = (route) => send("redirect", route);

const openGameAndRedirect = () =>
  openGame().then((slug) => slug && redirect(`/games/${slug}/map`));

export const setMenu = () => {
  const recents = map(
    ({ title, slug }) => ({
      label: title,
      click: () => redirect(`/games/${slug}/map`),
    }),
    getRecents(),
  );

  const template = [
    ...(isMac
      ? [
          {
            label: app.name,
            submenu: [
              { role: "about" },
              { type: "separator" },
              { role: "services" },
              { type: "separator" },
              { role: "hide" },
              { role: "hideothers" },
              { role: "unhide" },
              { type: "separator" },
              { role: "quit" },
            ],
          },
        ]
      : []),
    {
      label: "&File",
      submenu: [
        {
          label: "Open",
          accelerator: "CmdOrCtrl+O",
          click: openGameAndRedirect,
        },
        {
          label: "Open Recents",
          submenu: recents,
        },
        { type: "separator" },
        { role: "quit" },
      ],
    },
    {
      role: "editMenu",
    },
    {
      label: "View",
      submenu: [
        { role: "reload" },
        { role: "forcereload" },
        { role: "toggledevtools" },
        { type: "separator" },
        {
          label: "App Info",
          accelerator: "CmdOrCtrl+U",
          click: () => redirect("/app"),
        },
        { type: "separator" },
        { role: "resetzoom" },
        { role: "zoomin" },
        { role: "zoomout" },
        { type: "separator" },
        { role: "togglefullscreen" },
      ],
    },
    {
      role: "windowMenu",
    },
    {
      label: "&Help",
      role: "help",
      submenu: [
        {
          label: "Documentation",
          accelerator: "CmdOrCtrl+D",
          click: () => redirect("/docs"),
        },
        {
          label: "Elements",
          accelerator: "CmdOrCtrl+E",
          click: () => redirect("/elements"),
        },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
};
