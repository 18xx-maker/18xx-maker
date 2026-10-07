// The fields that were renamed. Each old name still works and shows a
// deprecation warning: `key` is the message in problems.deprecations, `old`
// and `now` are the pointers of the field under its old and its new name.
// Each old name is also in 18Broken.json.
export const renames = [
  {
    key: "info_titleSize",
    old: "info.titleSize",
    now: "info.titleFontSize",
    value: 100,
  },
  {
    key: "info_subtitleSize",
    old: "info.subtitleSize",
    now: "info.subtitleFontSize",
    value: 30,
  },
  {
    key: "info_designerSize",
    old: "info.designerSize",
    now: "info.designerFontSize",
    value: 20,
  },
  {
    key: "phases_buy_companies",
    old: "phases[0].buy_companies",
    now: "phases[0].buyCompanies",
    value: true,
  },
  {
    key: "phases_events_close_companies",
    old: "phases[0].events.close_companies",
    now: "phases[0].events.closeCompanies",
    value: true,
  },
  {
    key: "phases_events_remove_tokens",
    old: "phases[0].events.remove_tokens",
    now: "phases[0].events.removeTokens",
    value: true,
  },
  {
    key: "trains_quantity_label",
    old: "trains[0].quantity_label",
    now: "trains[0].quantityLabel",
    value: "5+",
  },
  {
    key: "number_cards",
    old: "number_cards",
    now: "numberCards",
    value: ["red"],
  },
];

const base = () => ({
  info: { title: "Deprecated", subtitle: "s", designer: "d", publisher: "p" },
  meta: { id: "Deprecated", type: "bundled", slug: "Deprecated" },
  phases: [{ name: "2", limit: 4, tiles: "yellow" }],
  trains: [{ name: "2", price: 80, quantity: 2, color: "yellow" }],
});

const put = (data, pointer, value) => {
  const keys = pointer.split(/[.[\]]+/).filter(Boolean);
  keys.slice(0, -1).reduce((node, key, i) => {
    node[key] ??= /^\d+$/.test(keys[i + 1]) ? [] : {};
    return node[key];
  }, data)[keys.at(-1)] = value;
  return data;
};

// A game with every renamed field under its old name
export const deprecatedGame = () =>
  renames.reduce((game, r) => put(game, r.old, r.value), base());

// The same game with the new names
export const renamedGame = () =>
  renames.reduce((game, r) => put(game, r.now, r.value), base());
