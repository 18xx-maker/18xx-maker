import { BUNDLED } from "@/util/loading";

// The stored games a loader is needed for, one per slug, in a stable order.
// Bundled games are already in memory and render mode never touches storage.
export const loadableSummaries = (summaries, renderMode = false) => {
  if (renderMode) {
    return [];
  }

  const found = {};
  for (const [type, ofType] of Object.entries(summaries || {})) {
    if (type === BUNDLED) {
      continue;
    }

    for (const summary of Object.values(ofType || {})) {
      if (summary?.slug && !found[summary.slug]) {
        found[summary.slug] = {
          slug: summary.slug,
          id: summary.id,
          type: summary.type || type,
        };
      }
    }
  }

  return Object.values(found).sort((a, b) => a.slug.localeCompare(b.slug));
};

// Loads the games with read-only loaders ({ [type]: (id) => Promise<game> }).
// A game with no loader for its type or that fails to load is left out.
export const loadKnownGames = async (entries, loaders) => {
  const results = await Promise.allSettled(
    entries.map(async ({ id, type }) => {
      if (!loaders[type]) {
        throw new Error(`No loader for ${type} games`);
      }

      return loaders[type](id);
    }),
  );

  return results.flatMap((result, index) =>
    result.status === "fulfilled" && result.value
      ? [
          {
            slug: entries[index].slug,
            title:
              (typeof result.value.info?.title === "string" &&
                result.value.info.title) ||
              entries[index].id,
            tiles: result.value.tiles || {},
          },
        ]
      : [],
  );
};
