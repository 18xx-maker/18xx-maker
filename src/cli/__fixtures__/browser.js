import { vi } from "vitest";

// A fake Playwright browser for the tests of the commands: the pages answer
// like a page of the site in render mode that is ready, and the DevTools
// session answers like Chromium. What was sent to it is in session.send.

// A 1 by 1 pixel png, what a screenshot is
export const PNG = Uint8Array.from(
  atob(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR4nGNgYGD4DwABBAEAwS2OUAAAAABJRU5ErkJggg==",
  ),
  (c) => c.charCodeAt(0),
);

const answers = {
  "Page.printToPDF": () => ({ stream: "stream" }),
  "IO.read": () => ({ data: btoa("pdf"), base64Encoded: true, eof: true }),
  "Page.captureScreenshot": () => ({
    data: btoa(String.fromCharCode(...PNG)),
  }),
};

export const createFakeBrowser = () => {
  const failures = [];
  const session = {
    send: vi.fn(async (method) => {
      const at = failures.findIndex((failure) => failure.method === method);
      if (at >= 0) throw failures.splice(at, 1)[0].error;
      return (answers[method] || (() => ({})))();
    }),
    // The next command of this name fails
    failOnce: (method, error) => failures.push({ method, error }),
  };
  const page = {
    addInitScript: vi.fn(),
    goto: vi.fn(),
    waitForFunction: vi.fn(),
    // The element a png captures when given an expression, the render state
    // when given a function
    evaluate: vi.fn(async (what) =>
      typeof what === "string"
        ? { x: 0, y: 0, width: 240, height: 150 }
        : "ready",
    ),
    close: vi.fn(async () => {}),
    context: () => ({ newCDPSession: async () => session }),
  };
  const browser = { newPage: vi.fn(async () => page), close: vi.fn() };
  const server = { close: vi.fn(), address: () => ({ port: 1234 }) };

  return { page, session, browser, server };
};
