import { configure } from "@testing-library/dom";
import * as matchers from "@testing-library/jest-dom/matchers";
import { afterEach, beforeEach, expect, vi } from "vitest";

import "@tests/i18n";

expect.extend(matchers);

// Big maps render slowly, especially with many test files running at once
configure({ asyncUtilTimeout: 5000, defaultHidden: true });

// React and library problems surface as console errors/warnings. Fail the
// test that triggered them. Add known-harmless noise here, with a reason.
const allowed = [];

let spies = [];

beforeEach(() => {
  spies = ["error", "warn"].map((level) =>
    vi.spyOn(console, level).mockImplementation(() => {}),
  );
});

afterEach(() => {
  const calls = spies
    .flatMap((spy) => spy.mock.calls)
    .map((args) => args.join(" "));
  spies.forEach((spy) => spy.mockRestore());
  const unexpected = calls.filter(
    (message) => !allowed.some((pattern) => pattern.test(message)),
  );
  if (unexpected.length > 0) {
    throw new Error(
      `Unexpected console.error/console.warn:\n${unexpected.join("\n")}`,
    );
  }
});
