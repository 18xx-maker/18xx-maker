import "@tests/support/windowStub.js";

import { defaultKeymap, historyKeymap } from "@codemirror/commands";
import { foldKeymap } from "@codemirror/language";
import { lintKeymap } from "@codemirror/lint";
import { searchKeymap } from "@codemirror/search";

import { keyTable } from "@/components/editPanel/editorKeyTable";

import de from "@/locales/de.json";
import en from "@/locales/en.json";
import i18n from "@/locales/i18n";
import { availableLanguages } from "@/locales/language";
import zh from "@/locales/zh.json";
import { gameNav } from "@/util/gameNav";
import {
  buildTemplate,
  createT,
  languages,
  menuLanguage,
  nextLanguage,
} from "../../electron/main/menuTemplate.js";

const build = (options = {}) => {
  const send = vi.fn();
  const open = vi.fn();
  const template = buildTemplate({
    isMac: false,
    appName: "18xx Maker",
    recents: [{ title: "1889", slug: "1889" }],
    t: createT("en"),
    send,
    open,
    ...options,
  });
  return { template, send, open };
};

const flatten = (items) =>
  items.flatMap((item) => [item, ...flatten(item.submenu ?? [])]);
const items = (options) => flatten(build(options).template);
const byId = (id, options) => items(options).find((item) => item.id === id);
const click = (id) => {
  const built = build();
  flatten(built.template)
    .find((item) => item.id === id)
    .click();
  return built.send;
};

// A key as its modifiers and key, whatever the notation: "Mod-Shift-f" of
// CodeMirror and "CmdOrCtrl+Shift+F" of an accelerator are both "mod+shift+f".
// Ctrl counts as Mod (Cmd on macOS is Ctrl elsewhere), a key with Alt is
// dropped: the menu has none.
const canonical = (key, separator) => {
  const parts = key.split(separator);
  const name = parts.pop().toLowerCase() || separator;
  const modifiers = new Set(
    parts.map((part) =>
      ["mod", "ctrl", "cmd", "cmdorctrl", "meta"].includes(part.toLowerCase())
        ? "mod"
        : part.toLowerCase(),
    ),
  );
  return modifiers.has("alt")
    ? undefined
    : [...[...modifiers].sort(), name].join("+");
};

// The keys of the JSON editor: its own table and the CodeMirror keymaps it
// loads (JsonEditor.jsx), which the accelerators of the items must not repeat
const editorKeys = new Set(
  [
    ...Object.values(keyTable.normal).flat(),
    ...[
      ...defaultKeymap,
      ...historyKeymap,
      ...foldKeymap,
      ...searchKeymap,
      ...lintKeymap,
    ].flatMap(({ key, mac, win, linux }) => [
      key,
      // Ctrl on macOS (the Emacs keys) is not the Cmd of an accelerator
      mac?.includes("Ctrl") ? undefined : mac,
      win,
      linux,
    ]),
  ]
    .filter(Boolean)
    .map((key) => canonical(key, "-"))
    .filter(Boolean),
);

// The items that repeat an editor key on purpose or from before the menu: the
// editor's save is the save of the menu, the others were there already
const sharedWithEditor = ["CmdOrCtrl+S", "CmdOrCtrl+U", "CmdOrCtrl+D"];

// The accelerators of the role items and of the system
const reserved = [
  "CmdOrCtrl+R",
  "CmdOrCtrl+Shift+R",
  "CmdOrCtrl+Shift+I",
  "CmdOrCtrl+0",
  "CmdOrCtrl+Plus",
  "CmdOrCtrl+-",
  "CmdOrCtrl+W",
  "CmdOrCtrl+M",
  "CmdOrCtrl+Q",
  "CmdOrCtrl+Z",
  "CmdOrCtrl+Shift+Z",
  "CmdOrCtrl+Y",
  "CmdOrCtrl+X",
  "CmdOrCtrl+C",
  "CmdOrCtrl+V",
  "CmdOrCtrl+A",
  "CmdOrCtrl+H",
  "CmdOrCtrl+Q",
];

describe("menuLanguage", () => {
  it("takes the primary subtag of a supported language", () => {
    expect(menuLanguage("de-DE")).toBe("de");
    expect(menuLanguage("zh-CN")).toBe("zh");
    expect(menuLanguage("zh_TW")).toBe("zh");
    expect(menuLanguage("EN")).toBe("en");
  });

  it("rejects a language the menu does not have", () => {
    expect(menuLanguage("fr")).toBeUndefined();
    expect(menuLanguage("")).toBeUndefined();
    expect(menuLanguage(undefined)).toBeUndefined();
    expect(menuLanguage({ toString: () => "de" })).toBeUndefined();
  });
});

describe("nextLanguage", () => {
  it("is the supported language of the tag", () => {
    expect(nextLanguage("en", "de")).toBe("de");
    expect(nextLanguage("en", "zh-CN")).toBe("zh");
  });

  it("is nothing when the menu is already in it", () => {
    expect(nextLanguage("de", "de-DE")).toBeUndefined();
    expect(nextLanguage("en", "en")).toBeUndefined();
  });

  it("is English for a language the menu does not have", () => {
    // The language setting back to "System" in a system language without a
    // translation
    expect(nextLanguage("de", "fr")).toBe("en");
    expect(nextLanguage("zh", "")).toBe("en");
    expect(nextLanguage("en", "fr")).toBeUndefined();
  });

  it("ignores what is not a string", () => {
    expect(nextLanguage("de", undefined)).toBeUndefined();
    expect(nextLanguage("de", null)).toBeUndefined();
    expect(nextLanguage("de", { toString: () => "en" })).toBeUndefined();
  });

  it("has the languages of the app", () => {
    expect([...languages].sort()).toEqual(availableLanguages(i18n).sort());
  });
});

describe("the menu template", () => {
  it("has every string it uses in every locale file", () => {
    // The keys the template asks for, on both platforms
    const keys = new Set();
    for (const isMac of [false, true]) {
      build({
        isMac,
        t: (key) => {
          keys.add(key);
          return key;
        },
      });
    }
    expect(keys.size).toBeGreaterThan(30);
    expect(keys).toContain("elements.tiles.title");

    const lookup = (strings, key) =>
      key.split(".").reduce((value, part) => value?.[part], strings);
    for (const [language, strings] of Object.entries({ en, de, zh })) {
      const missing = [...keys].filter(
        (key) => typeof lookup(strings, key) !== "string",
      );
      expect({ language, missing }).toEqual({ language, missing: [] });
    }
    expect(languages.sort()).toEqual(["de", "en", "zh"]);
  });

  it("is in the language of the menu", () => {
    expect(createT("de")("menu.file")).toBe(de.menu.file);
    expect(createT("zh")("menu.file")).toBe(zh.menu.file);
    expect(createT("de")("menu.file")).not.toBe(en.menu.file);
  });

  it("has unique accelerators that are not bare letters or Ctrl+Alt", () => {
    const accelerators = items()
      .map((item) => item.accelerator)
      .filter(Boolean);

    expect(new Set(accelerators).size).toBe(accelerators.length);
    for (const accelerator of accelerators) {
      expect(accelerator).toMatch(/^CmdOrCtrl\+/);
      expect(accelerator).not.toMatch(/Alt/);
    }
    expect(accelerators.filter((a) => reserved.includes(a))).toEqual([]);
    expect(
      accelerators.filter(
        (a) =>
          !sharedWithEditor.includes(a) && editorKeys.has(canonical(a, "+")),
      ),
    ).toEqual([]);
  });

  it("shows the sidebar key without registering it", () => {
    const sidebar = byId("sidebar");
    expect(sidebar.accelerator).toBe("CmdOrCtrl+B");
    expect(sidebar.registerAccelerator).toBe(false);
    expect(
      items()
        .filter((item) => item.registerAccelerator === false)
        .map((item) => item.id),
    ).toEqual(["sidebar"]);
  });

  it("sends the key an item stands for", () => {
    const sends = {
      export: "x",
      download: "d",
      edit: "e",
      json: "j",
      find: "/",
      paginate: "n",
      config: "c",
      "reset-view": "v",
      sidebar: "mod+b",
      "current-game": "g",
      previous: "[",
      next: "]",
      shortcuts: "?",
    };

    for (const [id, key] of Object.entries(sends)) {
      expect(click(id)).toHaveBeenCalledWith("menu", key);
    }
  });

  it("goes to a page with a redirect", () => {
    expect(click("home")).toHaveBeenCalledWith("redirect", "/");
    expect(click("load")).toHaveBeenCalledWith("redirect", "/games/");
    expect(click("elements-tiles")).toHaveBeenCalledWith(
      "redirect",
      "/elements/tiles",
    );
    expect(click("elements-atoms")).toHaveBeenCalledWith(
      "redirect",
      "/elements",
    );
  });

  it("has an item for every section of a game", () => {
    for (const { key, section } of gameNav) {
      const item = byId(`section-${section}`);
      expect(item.label).toBeTruthy();
      expect(click(`section-${section}`)).toHaveBeenCalledWith("menu", key);
      // Ctrl+0 is the zoom reset
      expect(item.accelerator).toBe(
        key === "0" ? undefined : `CmdOrCtrl+${key}`,
      );
    }
  });

  it("keeps the items that were there", () => {
    const { template, send, open } = build();
    const all = flatten(template);
    const named = (label) => all.find((item) => item.label === label);

    named("Open").click();
    expect(open).toHaveBeenCalled();
    expect(named("Open").accelerator).toBe("CmdOrCtrl+O");
    named("1889").click();
    expect(send).toHaveBeenCalledWith("redirect", "/games/1889/map");
    expect(byId("save").accelerator).toBe("CmdOrCtrl+S");
    expect(named("App Information").accelerator).toBe("CmdOrCtrl+U");
    expect(named("Documentation").accelerator).toBe("CmdOrCtrl+D");
    expect(
      all.filter((item) => item.accelerator === "CmdOrCtrl+E"),
    ).toHaveLength(1);
  });

  it("has the menu named after the app only on a Mac", () => {
    expect(build().template[0].label).toBe("&File");
    const mac = build({ isMac: true }).template;
    expect(mac[0].label).toBe("18xx Maker");
    expect(mac[0].submenu[0]).toEqual({ role: "about" });
  });

  it("has an explicit Edit menu with its own items after the roles", () => {
    const edit = (isMac) =>
      build({ isMac }).template.find((menu) => menu.label === "&Edit").submenu;
    const roles = (submenu) => submenu.map((item) => item.role ?? item.id);

    expect(roles(edit(false))).toEqual([
      "undo",
      "redo",
      undefined,
      "cut",
      "copy",
      "paste",
      "delete",
      "selectAll",
      undefined,
      "edit",
      "json",
      "find",
    ]);
    expect(roles(edit(true))).toEqual([
      "undo",
      "redo",
      undefined,
      "cut",
      "copy",
      "paste",
      "pasteAndMatchStyle",
      "delete",
      "selectAll",
      undefined,
      undefined,
      undefined,
      "edit",
      "json",
      "find",
    ]);
  });
});
