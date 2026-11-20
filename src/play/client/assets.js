// The custom images of a server game, as the runtime asset map of
// util/assetNames ({ icons, logos, trains }). The server names an asset
// "<kind>.<name>" (split on the first dot: a name may hold dots).
// `fetchAsset(name)` gives its Blob (api.getAsset or api.watchAsset bound to
// the game). At most LIMIT fetches are in flight; an asset that fails, is too
// big or is malformed is left out (it never rejects), and the map passes
// through sanitizeAssets before anything draws it.
import { KINDS, maxBytes, pngDataUri } from "@/util/assetNames";
import { sanitizeAssets } from "@/util/assets";

const LIMIT = 4;

const split = (name) => {
  const dot = typeof name === "string" ? name.indexOf(".") : -1;
  if (dot < 0) return null;
  const kind = name.slice(0, dot);
  return KINDS.includes(kind) ? { kind, name: name.slice(dot + 1) } : null;
};

const read = async (kind, blob) => {
  if (!blob || blob.size > maxBytes(kind)) return null;
  return kind === "trains"
    ? pngDataUri(new Uint8Array(await blob.arrayBuffer()))
    : blob.text();
};

export const loadAssets = async ({ fetchAsset, names }) => {
  const queue = (names || []).flatMap((full) => {
    const parts = split(full);
    return parts ? [{ full, ...parts }] : [];
  });
  const assets = Object.fromEntries(KINDS.map((kind) => [kind, {}]));

  const worker = async () => {
    while (queue.length) {
      const { full, kind, name } = queue.shift();
      try {
        const value = await read(kind, await fetchAsset(full));
        if (typeof value === "string") assets[kind][name] = value;
      } catch {
        // Missing or unreadable: the board keeps its placeholder
      }
    }
  };
  await Promise.all(Array.from({ length: LIMIT }, worker));

  return sanitizeAssets(assets);
};

export default loadAssets;
