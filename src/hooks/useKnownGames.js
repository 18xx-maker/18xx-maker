import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";

import { games as bundled } from "@/data";
import { loadKnownGames, loadableSummaries } from "@/util/knownGames";
import { getRenderInput } from "@/util/renderInput";
import * as idb from "@/util/storage/idb";
import * as opfs from "@/util/storage/opfs";

const loaders = { internal: opfs.peekGame, system: idb.peekGame };

const bundledGames = Object.values(bundled).map((game) => ({
  slug: game.meta.slug,
  title: game.info?.title || game.meta.id,
  tiles: game.tiles || {},
}));

// Every game the app knows about: the bundled ones at once, the stored ones
// as they load, read-only. { games: [{ slug, title, tiles }] }
const useKnownGames = () => {
  const summaries = useSelector((state) => state.summaries);
  // Only a change in the list of games reloads them
  const key = JSON.stringify(loadableSummaries(summaries, !!getRenderInput()));
  const [loaded, setLoaded] = useState([]);

  useEffect(() => {
    const entries = JSON.parse(key);
    if (entries.length === 0) {
      return undefined;
    }

    let current = true;
    loadKnownGames(entries, loaders).then((games) => {
      if (current) {
        setLoaded(games);
      }
    });

    return () => {
      current = false;
    };
  }, [key]);

  const games = useMemo(
    () => [...bundledGames, ...(key === "[]" ? [] : loaded)],
    [key, loaded],
  );

  return { games };
};

export default useKnownGames;
