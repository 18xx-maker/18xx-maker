import de from "@/locales/de.json";
import en from "@/locales/en.json";
import zh from "@/locales/zh.json";
import { gameNav } from "@/util/gameNav";

// The template of the native menu, with everything of Electron passed in so it
// can be tested (electron/main/menu.js builds and sets the menu).
//
// A menu item that stands for a key of the app sends it to the page over the
// "menu" channel (see runKey in src/hooks/bindings.js), the others redirect.
// Accelerators are never bare letters (the page owns those), never Alt
// (Ctrl+Alt is AltGr on Windows), and none that the code editor binds (its
// key table and the CodeMirror keymaps, see menu.test.js) or the system
// reserves.

const locales = { en, de, zh };

export const languages = Object.keys(locales);

// The supported language of a tag such as "de-DE" or "zh-CN", else undefined
export const menuLanguage = (tag) => {
  const language =
    typeof tag === "string" ? tag.split(/[-_]/)[0].toLowerCase() : undefined;
  return languages.includes(language) ? language : undefined;
};

// The language the menu changes to for the tag the page sends: the supported
// one, English for any other string (the page resolved "System" to a language
// the menu does not have), nothing for what is not a string. It is undefined
// when the menu is already in it.
export const nextLanguage = (current, tag) => {
  if (typeof tag !== "string") return undefined;
  const next = menuLanguage(tag) ?? "en";
  return next === current ? undefined : next;
};

const lookup = (strings, key) =>
  key.split(".").reduce((value, part) => value?.[part], strings);

// t(key) in the language, English for a missing string
export const createT = (language) => (key) =>
  lookup(locales[language], key) ?? lookup(en, key) ?? key;

// The sections of a game have a menu item with Ctrl+1 to Ctrl+9, the tenth is
// without one (Ctrl+0 resets the zoom)
const sectionItem = ({ key, section }, { t, send }) => ({
  label: t(`game.nav.${section}`),
  id: `section-${section}`,
  ...(key !== "0" && { accelerator: `CmdOrCtrl+${key}` }),
  click: () => send("menu", key),
});

export const buildTemplate = ({ isMac, appName, recents, t, send, open }) => {
  const redirect = (route) => send("redirect", route);
  const command = (key) => () => send("menu", key);

  return [
    ...(isMac
      ? [
          {
            label: appName,
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
      label: t("menu.file"),
      submenu: [
        {
          label: t("menu.open"),
          accelerator: "CmdOrCtrl+O",
          click: open,
        },
        {
          label: t("menu.openRecents"),
          submenu: recents.map(({ title, slug }) => ({
            label: title,
            click: () => redirect(`/games/${slug}/map`),
          })),
        },
        {
          label: t("menu.save"),
          id: "save",
          accelerator: "CmdOrCtrl+S",
          click: () => send("save"),
        },
        { type: "separator" },
        {
          label: t("menu.export"),
          id: "export",
          accelerator: "CmdOrCtrl+Shift+E",
          click: command("x"),
        },
        {
          label: t("menu.download"),
          id: "download",
          accelerator: "CmdOrCtrl+Shift+D",
          click: command("d"),
        },
        { type: "separator" },
        { role: "quit" },
      ],
    },
    {
      label: t("menu.edit"),
      submenu: [
        { role: "undo" },
        { role: "redo" },
        { type: "separator" },
        { role: "cut" },
        { role: "copy" },
        { role: "paste" },
        ...(isMac
          ? [
              { role: "pasteAndMatchStyle" },
              { role: "delete" },
              { role: "selectAll" },
              { type: "separator" },
              {
                label: t("menu.speech"),
                submenu: [{ role: "startSpeaking" }, { role: "stopSpeaking" }],
              },
            ]
          : [{ role: "delete" }, { role: "selectAll" }]),
        { type: "separator" },
        {
          label: t("nav.edit"),
          id: "edit",
          accelerator: "CmdOrCtrl+Shift+Y",
          click: command("e"),
        },
        {
          label: t("menu.editJson"),
          id: "json",
          accelerator: "CmdOrCtrl+J",
          click: command("j"),
        },
        {
          label: t("menu.findField"),
          id: "find",
          accelerator: "CmdOrCtrl+Shift+T",
          click: command("/"),
        },
      ],
    },
    {
      label: t("menu.view"),
      submenu: [
        { role: "reload" },
        { role: "forcereload" },
        { role: "toggledevtools" },
        { type: "separator" },
        {
          label: t("app.title"),
          accelerator: "CmdOrCtrl+U",
          click: () => redirect("/app"),
        },
        { type: "separator" },
        {
          label: t("game.paginated"),
          id: "paginate",
          accelerator: "CmdOrCtrl+Shift+P",
          click: command("n"),
        },
        {
          label: t("config.toggle"),
          id: "config",
          accelerator: "CmdOrCtrl+Shift+C",
          click: command("c"),
        },
        {
          label: t("menu.resetView"),
          id: "reset-view",
          accelerator: "CmdOrCtrl+Shift+V",
          click: command("v"),
        },
        {
          // The page handles Cmd/Ctrl+B itself, the item only shows the key
          label: t("ui.toggleSidebar"),
          id: "sidebar",
          accelerator: "CmdOrCtrl+B",
          registerAccelerator: false,
          click: command("mod+b"),
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
      label: t("menu.go"),
      submenu: [
        {
          label: t("nav.home"),
          id: "home",
          accelerator: "CmdOrCtrl+Shift+H",
          click: () => redirect("/"),
        },
        {
          label: t("nav.load"),
          id: "load",
          accelerator: "CmdOrCtrl+L",
          click: () => redirect("/games/"),
        },
        {
          label: t("menu.currentGame"),
          id: "current-game",
          accelerator: "CmdOrCtrl+Shift+N",
          click: command("g"),
        },
        { type: "separator" },
        {
          label: t("menu.previous"),
          id: "previous",
          accelerator: "CmdOrCtrl+PageUp",
          click: command("["),
        },
        {
          label: t("menu.next"),
          id: "next",
          accelerator: "CmdOrCtrl+PageDown",
          click: command("]"),
        },
        { type: "separator" },
        ...gameNav.map((item) => sectionItem(item, { t, send })),
        { type: "separator" },
        {
          label: t("nav.elements"),
          submenu: [
            ["atoms", "/elements"],
            ["tiles", "/elements/tiles"],
            ["logos", "/elements/logos"],
            ["positioning", "/elements/positioning"],
          ].map(([id, route]) => ({
            label: t(`elements.${id}.title`),
            id: `elements-${id}`,
            click: () => redirect(route),
          })),
        },
      ],
    },
    {
      role: "windowMenu",
    },
    {
      label: t("menu.help"),
      role: "help",
      submenu: [
        {
          label: t("menu.docs"),
          accelerator: "CmdOrCtrl+D",
          click: () => redirect("/docs"),
        },
        {
          label: t("nav.elements"),
          accelerator: "CmdOrCtrl+E",
          click: () => redirect("/elements"),
        },
        { type: "separator" },
        {
          label: t("menu.shortcuts"),
          id: "shortcuts",
          click: command("?"),
        },
      ],
    },
  ];
};
