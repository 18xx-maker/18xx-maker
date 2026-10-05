import { configure } from "@testing-library/dom";
import * as matchers from "@testing-library/jest-dom/matchers";
import { afterAll, afterEach, beforeAll, expect, vi } from "vitest";

import { checkConsole } from "@tests/support/console.js";

import "@tests/support/i18n";

expect.extend(matchers);

// Big maps render slowly, especially with many test files running at once
configure({ asyncUtilTimeout: 5000, defaultHidden: true });

// React and library problems surface as console errors/warnings. Fail the
// test that triggered them. Expected output is allowed per test with
// allowConsole from @tests/support/console.js.
const spies = [];

const check = () => {
  const messages = spies
    .flatMap((spy) => spy.mock.calls)
    .map((args) => args.join(" "));
  spies.forEach((spy) => spy.mockClear());
  const problem = checkConsole(messages);
  if (problem) {
    throw new Error(problem);
  }
};

// Code loads its highlighter on demand, which would finish outside of act
beforeAll(async () => {
  const { preloadCode } = await import("@/components/docs/Code");
  await preloadCode();
});

beforeAll(() => {
  ["error", "warn"].forEach((level) =>
    spies.push(vi.spyOn(console, level).mockImplementation(() => {})),
  );
});

// Late calls (after the last test) fail the file instead of vanishing
afterAll(() => {
  try {
    check();
  } finally {
    spies.forEach((spy) => spy.mockRestore());
    spies.length = 0;
  }
});

afterEach(check);
