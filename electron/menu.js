const { app, Menu } = require("electron");

const isMac = process.platform === "darwin";

const setMenu = (mainWindow) => {
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
          click: () => {
            mainWindow.webContents.send("redirect", "/games/");
          },
        },
        { type: "separator" },
        isMac ? { role: "close" } : { role: "quit" },
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
          click: () => {
            mainWindow.webContents.send("redirect", "/docs/");
          },
        },
        {
          label: "Elements",
          accelerator: "CmdOrCtrl+E",
          click: () => {
            mainWindow.webContents.send("redirect", "/elements/");
          },
        },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
};

module.exports = setMenu;
