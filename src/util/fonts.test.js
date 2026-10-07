import { resolveFontRole } from "#util/fonts";
import { resolveConfig, searchToConfig } from "#util/resolveConfig";

describe("resolveFontRole", () => {
  const fonts = {
    families: { fancy: "Georgia, serif" },
    roles: {
      body: { family: "serif", weight: "normal" },
      title: { size: 14, weight: "bold" },
      label: { family: "fancy", style: "italic" },
    },
  };

  it("returns nothing without fonts, so a text keeps its defaults", () => {
    expect(resolveFontRole(undefined, "title")).toEqual({});
    expect(resolveFontRole({}, "title")).toEqual({});
    expect(resolveFontRole({ roles: {} }, "card")).toEqual({});
  });

  it("puts the role over the body role", () => {
    expect(resolveFontRole(fonts, "title")).toEqual({
      fontFamily: "serif",
      fontSize: 14,
      fontWeight: "bold",
    });
  });

  it("inherits the body role for a role that is not set", () => {
    expect(resolveFontRole(fonts, "card")).toEqual({
      fontFamily: "serif",
      fontWeight: "normal",
    });
  });

  it("resolves a family name from families", () => {
    expect(resolveFontRole(fonts, "label")).toEqual({
      fontFamily: "Georgia, serif",
      fontWeight: "normal",
      fontStyle: "italic",
    });
  });

  it("passes a built-in alias or a CSS family through", () => {
    const font = (family) =>
      resolveFontRole({ roles: { price: { family } } }, "price").fontFamily;
    expect(font("display")).toBe("display");
    expect(font("Helvetica, Arial")).toBe("Helvetica, Arial");
  });

  it("leaves out settings that are undefined or null", () => {
    const font = resolveFontRole(
      {
        roles: { body: { size: 9 }, title: { size: undefined, family: null } },
      },
      "title",
    );
    expect(font).toEqual({ fontSize: 9 });
    expect("fontFamily" in font).toBe(false);
  });
});

describe("fonts in the config layers", () => {
  const defaults = { allowGameConfig: true };

  it("applies the settings of user and game together", () => {
    const { config } = resolveConfig({
      defaults,
      user: { fonts: { roles: { title: { size: 14 } } } },
      gameConfig: { fonts: { roles: { title: { weight: "normal" } } } },
    });
    expect(resolveFontRole(config.fonts, "title")).toEqual({
      fontSize: 14,
      fontWeight: "normal",
    });
  });

  it("has the game over the user for the same setting", () => {
    const { config } = resolveConfig({
      defaults,
      user: { fonts: { roles: { title: { weight: "bold" } } } },
      gameConfig: { fonts: { roles: { title: { weight: "normal" } } } },
    });
    expect(resolveFontRole(config.fonts, "title").fontWeight).toBe("normal");
  });

  it("ignores the fonts of the game unless allowed", () => {
    const { config } = resolveConfig({
      user: { fonts: { roles: { title: { weight: "bold" } } } },
      gameConfig: { fonts: { roles: { title: { weight: "normal" } } } },
    });
    expect(resolveFontRole(config.fonts, "title").fontWeight).toBe("bold");
  });

  it("reads the sizes of URL parameters as numbers", () => {
    expect(
      searchToConfig(
        "?config.fonts.roles.title.size=14&config.fonts.roles.card.size=x&config.fonts.roles.card.weight=bold",
      ),
    ).toEqual({
      fonts: { roles: { title: { size: 14 }, card: { weight: "bold" } } },
    });
  });
});
