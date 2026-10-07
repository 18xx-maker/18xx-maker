import { resolveConfig, searchToConfig } from "#util/resolveConfig";

describe("searchToConfig", () => {
  it("reads config.* parameters into a nested object", () => {
    expect(
      searchToConfig("?config.cards.layout=die&config.paper.margins=5&x=1"),
    ).toEqual({ cards: { layout: "die" }, paper: { margins: "5" } });
  });

  it("ignores other parameters and a bare config key", () => {
    expect(searchToConfig("?config=1&paginated=true&other.a=1")).toEqual({});
    expect(searchToConfig()).toEqual({});
  });

  it("accepts URLSearchParams", () => {
    expect(searchToConfig(new URLSearchParams("config.a.b=c"))).toEqual({
      a: { b: "c" },
    });
  });
});

describe("resolveConfig", () => {
  const defaults = { cards: { layout: "free", width: 1 }, paper: { size: 8 } };

  it("returns the defaults with nothing else", () => {
    const { config, searchConfig, gameConfig } = resolveConfig({ defaults });
    expect(config).toEqual(defaults);
    expect(searchConfig).toEqual({});
    expect(gameConfig).toEqual({});
  });

  it("applies user, stored, search and game config in that order", () => {
    const base = {
      defaults: { ...defaults, allowGameConfig: true },
      user: { cards: { layout: "user" } },
    };
    expect(resolveConfig(base).config.cards.layout).toBe("user");

    const stored = { ...base, stored: { cards: { layout: "stored" } } };
    expect(resolveConfig(stored).config.cards.layout).toBe("stored");

    const search = { ...stored, search: "?config.cards.layout=search" };
    expect(resolveConfig(search).config.cards.layout).toBe("search");

    const game = { ...search, gameConfig: { cards: { layout: "game" } } };
    const result = resolveConfig(game);
    expect(result.config.cards).toEqual({ layout: "game", width: 1 });
    expect(result.gameConfig).toEqual({ cards: { layout: "game" } });
    expect(result.searchConfig).toEqual({ cards: { layout: "search" } });
  });

  it("does not change its inputs", () => {
    const stored = { paper: { size: 9 } };
    resolveConfig({ defaults, stored, gameConfig: { paper: { size: 10 } } });
    expect(defaults.paper.size).toBe(8);
    expect(stored.paper.size).toBe(9);
  });
});

describe("the game config", () => {
  const defaults = { cards: { layout: "free" }, allowGameConfig: false };
  const gameConfig = { cards: { layout: "game" } };

  it("is ignored by default, and reported", () => {
    const result = resolveConfig({ defaults, gameConfig });
    expect(result.config.cards.layout).toBe("free");
    expect(result.gameConfigAllowed).toBe(false);
    expect(result.gameConfigIgnored).toBe(true);
    expect(result.gameConfig).toEqual(gameConfig);
  });

  it("applies when the user or the stored config allow it", () => {
    for (const layers of [
      { user: { allowGameConfig: true } },
      { stored: { allowGameConfig: true } },
    ]) {
      const result = resolveConfig({ defaults, gameConfig, ...layers });
      expect(result.config.cards.layout).toBe("game");
      expect(result.gameConfigAllowed).toBe(true);
      expect(result.gameConfigIgnored).toBe(false);
    }
  });

  it("is not allowed by the url", () => {
    const result = resolveConfig({
      defaults,
      gameConfig,
      search: "?config.allowGameConfig=true",
    });
    expect(result.config.cards.layout).toBe("free");
    expect(result.gameConfigIgnored).toBe(true);
    expect(result.config.allowGameConfig).toBe(false);
  });

  it("cannot set the setting or the print scale", () => {
    const result = resolveConfig({
      defaults: { ...defaults, printScale: 100 },
      user: { allowGameConfig: false },
      gameConfig: { allowGameConfig: true, printScale: 50 },
    });
    expect(result.config.allowGameConfig).toBe(false);
    expect(result.config.printScale).toBe(100);
    expect(result.gameConfig).toEqual({});
    expect(result.gameConfigIgnored).toBe(false);
  });

  it("is no override without a value", () => {
    for (const empty of [undefined, {}, { cards: {} }]) {
      expect(
        resolveConfig({ defaults, gameConfig: empty }).gameConfigIgnored,
      ).toBe(false);
    }
  });

  it("keeps the print scale at 100 in render mode", () => {
    const result = resolveConfig({
      defaults: { ...defaults, allowGameConfig: true, printScale: 120 },
      gameConfig,
      render: true,
    });
    expect(result.config.printScale).toBe(100);
    expect(result.config.cards.layout).toBe("game");
  });

  it("has a user layer without the url and the game", () => {
    const result = resolveConfig({
      defaults: { ...defaults, allowGameConfig: true },
      user: { theme: "user" },
      stored: { theme: "stored" },
      search: "?config.cards.layout=search",
      gameConfig,
    });
    expect(result.userLayerConfig).toEqual({
      cards: { layout: "free" },
      allowGameConfig: true,
      theme: "stored",
    });
  });

  it("loads 18Test with its own config when allowed", async () => {
    const { default: test } = await import("@/data/games/18Test.json");
    expect(test.config).toBeDefined();
    const config = (allowGameConfig) =>
      resolveConfig({
        defaults: { export: { allLayouts: false }, allowGameConfig },
        gameConfig: test.config,
      }).config;
    expect(config(true).export.allLayouts).toBe(true);
    expect(config(false).export.allLayouts).toBe(false);
  });
});

describe("the print scale", () => {
  const defaults = {
    printScale: 100,
    cards: { dice: { dtgDie: { width: 1 } } },
  };

  it("comes from the defaults, the user, the stored config and the url", () => {
    expect(resolveConfig({ defaults }).config.printScale).toBe(100);

    const user = { defaults, user: { printScale: 105 } };
    expect(resolveConfig(user).config.printScale).toBe(105);

    const stored = { ...user, stored: { printScale: 95 } };
    expect(resolveConfig(stored).config.printScale).toBe(95);

    const search = { ...stored, search: "?config.printScale=110" };
    expect(resolveConfig(search).config.printScale).toBe(110);
  });

  it("is not set by the game", () => {
    const result = resolveConfig({
      defaults,
      user: { printScale: 105, allowGameConfig: true },
      gameConfig: { printScale: 50, cards: { layout: "free" } },
    });
    expect(result.config.printScale).toBe(105);
    expect(result.config.cards.layout).toBe("free");
    expect(result.gameConfig).toEqual({ cards: { layout: "free" } });
  });

  it("is a number in range, whatever the url holds", () => {
    expect(searchToConfig("?config.printScale=110").printScale).toBe(110);
    expect(searchToConfig("?config.printScale=").printScale).toBe(100);
    expect(searchToConfig("?config.printScale=abc").printScale).toBe(100);
    expect(searchToConfig("?config.printScale=5000").printScale).toBe(200);
  });

  it("is 100 when it is not in any layer", () => {
    expect(resolveConfig({ defaults: {} }).config).toEqual({});
  });

  it("is always 100 in render mode", () => {
    const render = {
      defaults,
      user: { printScale: 110 },
      stored: { printScale: 120 },
      search: "?config.printScale=130",
      render: true,
    };
    expect(resolveConfig(render).config.printScale).toBe(100);
    expect(resolveConfig({ defaults: {}, render: true }).config).toEqual({
      printScale: 100,
    });
  });

  it("loads a stored config from before the setting at 100", () => {
    const stored = { theme: "cmk", paper: { width: 595 } };
    const { config } = resolveConfig({ defaults, stored });
    expect(config.printScale).toBe(100);
    expect(config.cards.dice).toEqual({ dtgDie: { width: 1 } });
  });
});

describe("the die sizes in the url", () => {
  it("are numbers", () => {
    expect(
      searchToConfig(
        "?config.cards.dice.dtgDie.width=260&config.cards.dice.miniEuroDie.sizes.share.height=99.5",
      ),
    ).toEqual({
      cards: {
        dice: {
          dtgDie: { width: 260 },
          miniEuroDie: { sizes: { share: { height: 99.5 } } },
        },
      },
    });
  });

  it("drop a value that is not a number", () => {
    expect(
      searchToConfig(
        "?config.cards.dice.dtgDie.width=wide&config.cards.dice.dtgDie.height=",
      ),
    ).toEqual({ cards: { dice: { dtgDie: {} } } });
  });

  it("do not change the other values", () => {
    expect(searchToConfig("?config.cards.layout=dtgDie")).toEqual({
      cards: { layout: "dtgDie" },
    });
  });
});
