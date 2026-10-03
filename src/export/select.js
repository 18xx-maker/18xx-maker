// The pages of a game that can be exported on their own, and the choice of
// documents of an export list by page. The elements of a sheet (a card, a
// token) are part of the sheet's name.
// Plain JS: no Node APIs, no DOM.
export const DOCS = [
  "background",
  "cards",
  "charters",
  "map",
  "market",
  "par",
  "revenue",
  "tile-manifest",
  "tiles",
  "tokens",
];

const SHEET = {
  card: "cards",
  charter: "charters",
  token: "tokens",
  tile: "tiles",
};

// The page of a document
export const docPage = (doc) => SHEET[doc.kind] || doc.kind;

// The documents of a game that the options ask for, for pdf and png
export const selectDocs = (docs, { docs: names, variation }) =>
  docs.filter(
    (doc) =>
      (!names || names.includes(docPage(doc))) &&
      (variation === undefined ||
        doc.variation === undefined ||
        doc.variation === variation),
  );
