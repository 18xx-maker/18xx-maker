import { screen } from "@testing-library/react";
import { vi } from "vitest";

import { renderApp } from "@tests/support/helpers.jsx";

// The app page only exists in electron, so fake the electron preload api.
// This has to be in place before the app modules are imported.
vi.hoisted(() => {
  const config = {
    config: {},
    path: "/config.json",
    platform: "darwin",
    versions: { app: "1", chrome: "1", electron: "1", system: "1" },
  };

  window.api = {
    loadConfig: () => Promise.resolve(config),
    loadPlatformAndVersions: () => config,
    loadSummaries: () => Promise.resolve([]),
    off: () => {},
    onAlert: () => {},
    onDownloadProgress: () => {},
    onGame: () => {},
    onProgress: () => {},
    onRedirect: () => {},
    onSave: () => {},
    onMenu: () => {},
    setLanguage: () => {},
    onUpdate: () => {},
  };
});

vi.mock("@/util/capability", async (importOriginal) => {
  const actual = await importOriginal();
  return { default: { ...actual.default, electron: true } };
});

describe("the app route", () => {
  it("renders the app page in electron", async () => {
    renderApp("/app");

    expect(await screen.findByTestId("app")).toBeInTheDocument();
    expect(await screen.findByText("/config.json")).toBeInTheDocument();
  });
});
