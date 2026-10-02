// @vitest-environment jsdom
// @vitest-environment-options { "url": "http://localhost:5173/" }

import { init, track } from "@plausible-analytics/tracker";

vi.mock("@plausible-analytics/tracker", () => ({
  init: vi.fn(),
  track: vi.fn(),
}));

const importAnalytics = async (prod) => {
  vi.resetModules();
  vi.stubEnv("PROD", prod);
  return import("@/util/analytics");
};

const location = { pathname: "/games/18Test/map", search: "" };

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe.each([
  ["in development", false],
  ["in production on localhost", true],
])("analytics %s", (_name, prod) => {
  it("does not send pageviews", async () => {
    const analytics = await importAnalytics(prod);
    analytics.trackPageview(location);

    expect(init).not.toHaveBeenCalled();
    expect(track).not.toHaveBeenCalled();
  });

  it("does not send events", async () => {
    const analytics = await importAnalytics(prod);
    analytics.trackEvent("Print", location, { page: "map" });

    expect(init).not.toHaveBeenCalled();
    expect(track).not.toHaveBeenCalled();
  });
});
