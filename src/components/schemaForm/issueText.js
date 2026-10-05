// The text of a problem of the game file (see src/util/gameValidation.js)
export const issueText = (t, issue) =>
  issue.code === "deprecated"
    ? t([
        `problems.deprecations.${issue.params.key}`,
        "problems.deprecated-generic",
      ])
    : t(`problems.${issue.code}`, issue.params);
