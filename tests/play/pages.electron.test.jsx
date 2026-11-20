import { screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { renderApp } from "@tests/support/helpers.jsx";
import { BASE, fakeServer } from "@tests/support/playServer.js";

// The electron preload api, faked: it has to exist before the app is imported
vi.hoisted(() => {
  const none = () => {};
  window.api = {
    loadPlatformAndVersions: () => ({ platform: "darwin", versions: {} }),
    setLanguage: none,
    off: none,
    ...Object.fromEntries(
      [
        "onAlert",
        "onAssets",
        "onDownloadProgress",
        "onGame",
        "onMenu",
        "onProgress",
        "onRedirect",
        "onSave",
        "onUpdate",
      ].map((name) => [name, none]),
    ),
  };
});

vi.mock("@/util/capability", async (importOriginal) => ({
  default: { ...(await importOriginal()).default, electron: true },
}));

afterEach(() => vi.unstubAllGlobals());

describe("play in the desktop app", () => {
  it.for(["/play", "/play/join/abc", "/play/g1"])(
    "%s shows the website notice and makes no request",
    async (url) => {
      window.localStorage.setItem(
        "play-tokens",
        JSON.stringify({ [BASE]: "t" }),
      );
      const fetch = fakeServer({});
      renderApp(url, { settings: { playServer: BASE } });
      expect(
        await screen.findByText(/available on the website/),
      ).toBeInTheDocument();
      expect(fetch).not.toHaveBeenCalled();
    },
  );
});
