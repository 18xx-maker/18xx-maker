import { gameNav } from "@/util/gameNav";
import { guardOn } from "../../electron/main/guard.js";
import {
  buildTemplate,
  createT,
  languages,
  menuLanguage,
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

// The accelerators of the role items and of the code editor, which the
// accelerators of the items must not repeat
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
  "CmdOrCtrl+X",
  "CmdOrCtrl+C",
  "CmdOrCtrl+V",
  "CmdOrCtrl+A",
  "CmdOrCtrl+F",
  "CmdOrCtrl+G",
  "CmdOrCtrl+[",
  "CmdOrCtrl+]",
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

describe("the setLanguage channel", () => {
  it("is ignored from a window that is not the main one", () => {
    const apply = vi.fn();
    const handler = guardOn(
      (event) => event.main,
      (event, tag) => apply(menuLanguage(tag)),
    );

    handler({ main: false }, "de");
    expect(apply).not.toHaveBeenCalled();
    handler({ main: true }, "de-DE");
    expect(apply).toHaveBeenCalledWith("de");
  });
});

describe("the menu template", () => {
  it("has a label for every item in every language", () => {
    for (const language of languages) {
      const t = createT(language);
      const missing = flatten(build({ t, recents: [] }).template).filter(
        (item) =>
          item.label !== undefined && /^(menu|nav|game)\./.test(item.label),
      );
      expect(missing).toEqual([]);
    }
    // And they are not all English
    expect(createT("de")("menu.file")).not.toBe(createT("en")("menu.file"));
    expect(createT("zh")("menu.file")).not.toBe(createT("en")("menu.file"));
    expect(createT("de")("nope")).toBe("nope");
  });

  it("falls back to English for a missing string", () => {
    expect(createT("de")("menu.file")).toBeTruthy();
    expect(createT("xx")("nav.home")).toBe("Home");
  });

  it("has unique accelerators that are not bare letters or Ctrl+Alt", () => {
    const accelerators = items()
      .map((item) => item.accelerator)
      .filter(Boolean);

    expect(new Set(accelerators).size).toBe(accelerators.length);
    for (const accelerator of accelerators) {
      expect(accelerator).toMatch(/^CmdOrCtrl\+/);
      expect(accelerator).not.toMatch(/Alt/);
      expect(reserved).not.toContain(accelerator);
    }
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
    expect(named("App Info").accelerator).toBe("CmdOrCtrl+U");
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
