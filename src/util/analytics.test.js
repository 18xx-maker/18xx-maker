// @vitest-environment jsdom

import * as analytics from "@/util/analytics";

describe("analytics", () => {
  describe("maskGame", () => {
    it("should ignore non game paths", () => {
      expect(analytics.maskGame()).toBeUndefined();
      expect(analytics.maskGame("")).toEqual("");
      expect(analytics.maskGame("/")).toEqual("/");
      expect(analytics.maskGame("/elements")).toEqual("/elements");
      expect(analytics.maskGame("/games")).toEqual("/games");
    });

    it("should mask out the game of any path", () => {
      expect(analytics.maskGame("/games/1889/map")).toEqual("/games/slug/map");
      expect(analytics.maskGame("/games/electron:1889/cards")).toEqual(
        "/games/electron:slug/cards",
      );
      expect(analytics.maskGame("/games/system:1889")).toEqual(
        "/games/system:slug",
      );
      expect(analytics.maskGame("/games/internal:1889/tiles")).toEqual(
        "/games/internal:slug/tiles",
      );
    });
  });

  describe("normalizePath", () => {
    it("should remove the / off of the end of paths", () => {
      expect(analytics.normalizePath({ pathname: "/", search: "" })).toEqual(
        "",
      );
      expect(
        analytics.normalizePath({ pathname: "/games/", search: "?foo=true" }),
      ).toEqual("/games?foo=true");
      expect(
        analytics.normalizePath({
          pathname: "/games/system:1889/map/",
          search: "?config=true",
        }),
      ).toEqual("/games/system:slug/map?config=true");
    });
  });

  describe("gatherPageviewData", () => {
    it("should mask the game and null out the referrer", () => {
      expect(
        analytics.gatherPageviewData({
          pathname: "/games/internal:1889/map",
          search: "",
        }),
      ).toEqual({
        referrer: null,
        url: "https://18xx-maker.com/games/internal:slug/map",
      });
    });
  });
});
