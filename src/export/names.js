import { titleToFilename } from "../util/index.js";

// A part of a file name that is safe on every file system: no path
// separators, reserved characters or leading dots
export const safeName = (name) =>
  String(name)
    .replace(/[\\/:*?"<>|]+/g, "_")
    .replace(/^\.+/, "_");

// The file name of a document: the slugged game title, the document's own
// name and the extension: shikoku-1889-map-paginated.pdf
export const fileName = (game, doc, format) =>
  `${titleToFilename(game.info.title)}-${doc.basename}.${format}`;

// Where a Board 18 box puts its files, relative to the output folder. The box
// uses the game id (not the title) and the version: board18-<id>-<version>/
export const b18Names = (id, version) => {
  const name = `${id}-${version}`;
  const folder = `board18-${name}`;
  return {
    name,
    folder,
    zip: `${folder}.zip`,
    json: `${folder}/${name}.json`,
    image: (file) => `${folder}/${name}/${file}.png`,
    imgLoc: (file) => `images/${name}/${file}.png`,
  };
};

// Every file to write for a list of documents: one per document and format,
// with the path relative to the output folder. A b18 document has its own
// path from the b18 spec.
export const exportJobs = (game, docs, formats) =>
  docs.flatMap((doc) =>
    doc.formats
      .filter((format) => formats.includes(format))
      .map((format) => ({
        doc,
        format,
        path: doc.path || fileName(game, doc, format),
      })),
  );

// Every format has its own folder in the folder of the game: pdf/<file>. A
// Board 18 job has its own path in the box.
export const formatFolder = (jobs) =>
  jobs.map((job) =>
    job.format === "b18" ? job : { ...job, path: `${job.format}/${job.path}` },
  );

// The path and query of a document on the site, "/games/1889/map?paginated=true"
export const docPath = (doc) => {
  const query = new URLSearchParams(doc.query).toString();
  return query ? `${doc.route}?${query}` : doc.route;
};
