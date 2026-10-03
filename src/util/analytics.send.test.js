// @vitest-environment jsdom
// @vitest-environment-options { "url": "https://www.18xx-maker.com/" }

import { init, track } from "@plausible-analytics/tracker";

vi.mock("@plausible-analytics/tracker", () => ({
  init: vi.fn(),
  track: vi.fn(),
}));

const importAnalytics = async () => {
  vi.resetModules();
  vi.stubEnv("PROD", true);
  return import("@/util/analytics");
};

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("sending analytics in production", () => {
  it("does not set up the tracker until something is sent", async () => {
    await importAnalytics();
    expect(init).not.toHaveBeenCalled();
  });

  it("sets up the tracker once and sends pageviews with the masked url", async () => {
    const analytics = await importAnalytics();

    analytics.trackPageview({ pathname: "/games/system:abc/map", search: "" });
    analytics.trackPageview({ pathname: "/games", search: "" });

    expect(init).toHaveBeenCalledTimes(1);
    expect(init).toHaveBeenCalledWith(
      expect.objectContaining({
        domain: "18xx-maker.com",
        endpoint: "https://analytics.18xx-maker.com/api/event",
        autoCapturePageviews: false,
      }),
    );

    const { transformRequest } = init.mock.calls[0][0];
    expect(transformRequest({ n: "pageview", r: "https://x.test/" })).toEqual({
      n: "pageview",
      r: null,
    });
    expect(track).toHaveBeenNthCalledWith(1, "pageview", {
      props: { interface: "site" },
      url: "https://18xx-maker.com/games/system:slug/map",
    });
    expect(track).toHaveBeenNthCalledWith(2, "pageview", {
      props: { interface: "site" },
      url: "https://18xx-maker.com/games",
    });
  });

  it("sends events with extra properties", async () => {
    const analytics = await importAnalytics();

    analytics.trackEvent(
      "download",
      { pathname: "/games/1889/map", search: "?config=true" },
      { kind: "json" },
    );

    expect(track).toHaveBeenCalledWith("download", {
      props: { interface: "site", kind: "json" },
      url: "https://18xx-maker.com/games/slug/map?config=true",
    });
  });

  it("sends the language part of the current language with pageviews and events", async () => {
    const analytics = await importAnalytics();
    const { default: i18n } = await import("i18next");
    await i18n.init({ lng: "fr-CA", resources: {} });

    analytics.trackPageview({ pathname: "/games", search: "" });
    analytics.trackEvent("refresh", { pathname: "/games", search: "" });

    expect(track).toHaveBeenNthCalledWith(1, "pageview", {
      props: { interface: "site", language: "fr" },
      url: "https://18xx-maker.com/games",
    });
    expect(track).toHaveBeenNthCalledWith(2, "refresh", {
      props: { interface: "site", language: "fr" },
      url: "https://18xx-maker.com/games",
    });
  });
});
