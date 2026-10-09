/* eslint-disable testing-library/no-node-access, testing-library/prefer-screen-queries, jest-dom/prefer-to-have-attribute -- the images are bare svg elements with no role */
import { configureStore } from "@reduxjs/toolkit";
import { render } from "@testing-library/react";
import { Provider } from "react-redux";

import { icons, logos, trainImages } from "@/data";
import { initialState, rootReducer } from "@/state";
import {
  MAX_FILES,
  MAX_SVG_BYTES,
  emptyAssets,
  pngDataUri,
} from "@/util/assetNames";
import { customIds, resolveAsset, sanitizeAssets } from "@/util/assets";

import { makePng } from "@tests/support/png.js";

const SVG =
  '<svg viewBox="0 0 10 10"><path class="color-main" d="M0 0h5v5z"/></svg>';
const PNG = pngDataUri(makePng());

const assets = () => {
  const map = emptyAssets();
  map.icons.star = SVG;
  map.logos.crest = SVG;
  map.trains.loco = PNG;
  return map;
};

const Draw = ({ Component }) => (
  <svg data-testid="host">
    <Component className="x" width="25" height="25" x="-12.5" y="-12.5" />
  </svg>
);

describe("resolveAsset", () => {
  it("gives the built-in image for a name", () => {
    expect(resolveAsset("icons", "boat", undefined)).toBe(icons.boat);
    const logo = Object.keys(logos)[0];
    expect(resolveAsset("logos", logo, assets())).toBe(logos[logo]);
    const train = Object.keys(trainImages)[0];
    expect(resolveAsset("trains", train, undefined)).toBe(trainImages[train]);
  });

  it("gives a component for a custom icon or logo and the uri for a train", () => {
    const map = assets();
    expect(typeof resolveAsset("icons", "custom/star", map)).toBe("function");
    expect(typeof resolveAsset("logos", "custom/crest", map)).toBe("function");
    expect(resolveAsset("trains", "custom/loco", map)).toBe(PNG);
  });

  it("gives the same component for the same image", () => {
    const map = assets();
    expect(resolveAsset("icons", "custom/star", map)).toBe(
      resolveAsset("icons", "custom/star", assets()),
    );
  });

  it("draws the component as a nested svg with the color class", () => {
    const Component = resolveAsset("icons", "custom/star", assets());
    const { getByTestId } = render(<Draw Component={Component} />);
    const nested = getByTestId("host").firstElementChild;
    expect(nested.tagName).toBe("svg");
    expect(nested.getAttribute("width")).toBe("25");
    expect(nested.getAttribute("viewBox")).toBe("0 0 10 10");
    expect(nested.getAttribute("class")).toBe("x");
    expect(nested.querySelector("path.color-main")).not.toBeNull();
  });

  it("gives nothing for a custom image that is not there, never a built-in", () => {
    const map = assets();
    expect(resolveAsset("icons", "custom/nope", map)).toBeUndefined();
    expect(resolveAsset("icons", "custom/star", undefined)).toBeUndefined();
    expect(resolveAsset("icons", "custom/star", emptyAssets())).toBeUndefined();
    // A kind does not see the images of another
    expect(resolveAsset("logos", "custom/star", map)).toBeUndefined();
    expect(resolveAsset("icons", "custom/crest", map)).toBeUndefined();
    expect(resolveAsset("icons", "star", map)).toBeUndefined();
  });

  it("does not shadow a built-in image with a custom one", () => {
    const map = emptyAssets();
    map.icons.boat = SVG;
    expect(resolveAsset("icons", "boat", map)).toBe(icons.boat);
  });

  it("only reads own properties", () => {
    const plain = { icons: {}, logos: {}, trains: {} };
    for (const name of [
      "__proto__",
      "constructor",
      "hasOwnProperty",
      "toString",
    ]) {
      expect(resolveAsset("icons", `custom/${name}`, plain)).toBeUndefined();
      expect(resolveAsset("trains", `custom/${name}`, plain)).toBeUndefined();
      expect(resolveAsset("icons", name, plain)).toBeUndefined();
    }
    expect(resolveAsset("nope", "boat", plain)).toBeUndefined();
    expect(resolveAsset("icons", 5, plain)).toBeUndefined();
  });

  it("lists the custom ids sorted", () => {
    const map = assets();
    map.icons.alpha = SVG;
    expect(customIds("icons", map)).toEqual(["custom/alpha", "custom/star"]);
    expect(customIds("icons", undefined)).toEqual([]);
  });
});

describe("sanitizeAssets", () => {
  it("keeps good images and drops the rest", () => {
    const map = {
      icons: {
        star: SVG,
        "-bad": SVG,
        con: SVG,
        script:
          '<svg xmlns="http://www.w3.org/2000/svg"><script>x</script></svg>',
        text: "not svg",
        number: 5,
      },
      logos: { crest: SVG },
      trains: {
        loco: PNG,
        text: "data:image/png;base64,!!!",
        svg: "data:image/svg+xml;base64,AAAA",
        magic: pngDataUri(makePng({ signature: false })),
        big: pngDataUri(makePng({ width: 5000, height: 1 })),
      },
      extra: { a: SVG },
    };
    const clean = sanitizeAssets(map);
    expect(Object.keys(clean.icons)).toEqual(["star"]);
    expect(Object.keys(clean.logos)).toEqual(["crest"]);
    expect(Object.keys(clean.trains)).toEqual(["loco"]);
    expect(clean).not.toHaveProperty("extra");
  });

  it("copes with nothing and with wrong shapes", () => {
    expect(sanitizeAssets(undefined)).toEqual(emptyAssets());
    expect(sanitizeAssets(null)).toEqual(emptyAssets());
    expect(sanitizeAssets({ icons: "x", logos: [], trains: 3 })).toEqual(
      emptyAssets(),
    );
  });

  it("drops a name that only differs in case from an earlier one", () => {
    const clean = sanitizeAssets({ icons: { Star: SVG, star: SVG } });
    expect(Object.keys(clean.icons)).toEqual(["Star"]);
  });

  it("drops images over the size and count limits", () => {
    const big = `<svg viewBox="0 0 1 1"><path d="M0 0"/><!--${"x".repeat(MAX_SVG_BYTES)}--></svg>`;
    expect(Object.keys(sanitizeAssets({ icons: { big } }).icons)).toEqual([]);

    const many = Object.fromEntries(
      Array.from({ length: MAX_FILES + 5 }, (_, i) => [`n${i}`, SVG]),
    );
    expect(Object.keys(sanitizeAssets({ icons: many }).icons)).toHaveLength(
      MAX_FILES,
    );
  });

  it("has maps that do not inherit anything", () => {
    const clean = sanitizeAssets({ icons: { star: SVG } });
    expect(Object.getPrototypeOf(clean.icons)).toBeNull();
    expect(Object.hasOwn(clean.icons, "toString")).toBe(false);
  });
});

describe("the assets of the game on screen", () => {
  it("are read from the state by the slug of the game", async () => {
    const { selectAssets } = await import("@/state/selectors");
    const map = assets();
    const state = {
      ...initialState,
      assets: { "system:a": map, "system:b": emptyAssets() },
      game: { meta: { slug: "system:a" } },
    };
    expect(selectAssets(state)).toBe(map);
    expect(selectAssets({ ...state, game: undefined })).toBeUndefined();
    expect(
      selectAssets({ ...state, game: { meta: { slug: "system:z" } } }),
    ).toBeUndefined();
  });

  it("is not kept in local storage", () => {
    window.localStorage.clear();
    const store = configureStore({ reducer: rootReducer });
    store.dispatch({ type: "SET_ASSETS", slug: "system:a", assets: assets() });
    expect(store.getState().assets["system:a"].icons.star).toBe(SVG);
    expect(Provider).toBeDefined();
    expect(window.localStorage.getItem("assets")).toBeNull();
  });
});
