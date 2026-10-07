// A game with one of each renamed field under its old name, for the tests of
// the deprecation warnings. Each old name is also in 18Broken.json.
export const deprecatedGame = () => ({
  info: {
    title: "Deprecated",
    subtitle: "s",
    designer: "d",
    publisher: "p",
    titleSize: 100,
    subtitleSize: 30,
    designerSize: 20,
  },
  meta: { id: "Deprecated", type: "bundled", slug: "Deprecated" },
});

// The key of the message of each old name, in problems.deprecations
export const deprecatedKeys = {
  "info.titleSize": "info_titleSize",
  "info.subtitleSize": "info_subtitleSize",
  "info.designerSize": "info_designerSize",
};
