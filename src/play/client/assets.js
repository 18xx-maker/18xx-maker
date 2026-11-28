// The custom images of a server game, as the runtime asset map of
// util/assetNames ({ icons, logos, trains }). The server names an asset
// "<kind>.<name>" (split on the first dot: a name may hold dots).
// `fetchAsset(name)` gives its Blob (api.getAsset or api.watchAsset bound to
// the game). The server is whatever the person set, so the limits hold while
// loading, not only after: an invalid name is never requested, at most
// MAX_FILES are, at most LIMIT at once, and fetching stops once the kept
// bytes would pass MAX_TOTAL_BYTES. `isCancelled()` (the caller went away)
// stops the workers before their next request. An asset that fails, is too
// big or is malformed is left out (it never rejects), and the map passes
// through sanitizeAssets before anything draws it.
import {
  KINDS,
  MAX_FILES,
  MAX_TOTAL_BYTES,
  isValidName,
  maxBytes,
  pngDataUri,
} from "@/util/assetNames";
import { sanitizeAssets } from "@/util/assets";

const LIMIT = 4;

const split = (name) => {
  const dot = typeof name === "string" ? name.indexOf(".") : -1;
  if (dot < 0) return null;
  const kind = name.slice(0, dot);
  const rest = name.slice(dot + 1);
  return KINDS.includes(kind) && isValidName(rest)
    ? { kind, name: rest }
    : null;
};

const read = (kind, blob) =>
  kind === "trains"
    ? blob.arrayBuffer().then((buffer) => pngDataUri(new Uint8Array(buffer)))
    : blob.text();

export const loadAssets = async ({
  fetchAsset,
  names,
  isCancelled = () => false,
}) => {
  const queue = (Array.isArray(names) ? names : [])
    .flatMap((full) => {
      const parts = split(full);
      return parts ? [{ full, ...parts }] : [];
    })
    .slice(0, MAX_FILES);
  const assets = Object.fromEntries(KINDS.map((kind) => [kind, {}]));
  let bytes = 0;
  let full = false;

  const worker = async () => {
    while (queue.length && !full && !isCancelled()) {
      const asset = queue.shift();
      try {
        const blob = await fetchAsset(asset.full);
        if (!blob || blob.size > maxBytes(asset.kind)) continue;
        if (bytes + blob.size > MAX_TOTAL_BYTES) {
          full = true;
          continue;
        }
        bytes += blob.size;
        const value = await read(asset.kind, blob);
        if (typeof value === "string") assets[asset.kind][asset.name] = value;
      } catch {
        // Missing or unreadable: the board keeps its placeholder
      }
    }
  };
  await Promise.all(Array.from({ length: LIMIT }, worker));

  return sanitizeAssets(assets);
};

export default loadAssets;
