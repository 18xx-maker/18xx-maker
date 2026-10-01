// Console output that a single test expects, see allowConsole
let allowed = [];

// Allow console.error/console.warn output matching pattern in the current
// test only. The test fails if nothing matched, so fixing the underlying
// problem flags the stale allowance.
export const allowConsole = (pattern) => {
  allowed.push({ pattern, matched: false });
};

// Returns an error message when messages contain anything not allowed or an
// allowance went unused, and resets the allowances.
export const checkConsole = (messages) => {
  const current = allowed;
  allowed = [];
  const unexpected = messages.filter((message) => {
    const entry = current.find(({ pattern }) => pattern.test(message));
    if (entry) {
      entry.matched = true;
    }
    return !entry;
  });
  const unused = current.filter(({ matched }) => !matched);
  const problems = [];
  if (unexpected.length > 0) {
    problems.push(
      `Unexpected console.error/console.warn:\n${unexpected.join("\n")}`,
    );
  }
  if (unused.length > 0) {
    problems.push(
      `Allowed console output never happened (fix the test): ${unused.map(({ pattern }) => pattern).join(", ")}`,
    );
  }
  return problems.join("\n");
};
