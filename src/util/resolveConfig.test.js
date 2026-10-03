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
    const base = { defaults, user: { cards: { layout: "user" } } };
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
