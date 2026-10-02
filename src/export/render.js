// The slug and meta of a game in headless render mode, see util/renderInput.
// A game the page is given has this meta whatever it had before, so the routes
// of the export list (data.slug in documents) can be planned without loading
// the game.
export const renderSlug = (id) => `render:${id}`;

export const renderGame = (game, id) => ({
  ...game,
  meta: { id, type: "render", slug: renderSlug(id) },
});
