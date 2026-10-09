// The custom images of the bundled games: <id>.assets/<kind>/<name>.svg|png
// (see util/assetNames), by game id, in the shape of the runtime asset map.
// Apart from data/games so a test can replace the games and keep the images.
const assetFiles = {
  ...import.meta.glob("./games/*.assets/{icons,logos}/*.svg", {
    eager: true,
    query: "?raw",
    import: "default",
  }),
  ...import.meta.glob("./games/*.assets/trains/*.png", {
    eager: true,
    query: "?inline",
    import: "default",
  }),
};

export const bundledAssets = {};

for (const [path, value] of Object.entries(assetFiles)) {
  const [, id, kind, name] = path.match(
    /^\.\/games\/(.*)\.assets\/([^/]+)\/(.*)\.[a-z]+$/,
  );
  bundledAssets[id] ??= { icons: {}, logos: {}, trains: {} };
  bundledAssets[id][kind][name] = value;
}
