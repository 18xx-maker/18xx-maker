import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router";

import {
  filter,
  is,
  map,
  max,
  min,
  reduce,
  sortBy,
  split,
  splitEvery,
  uniq,
} from "ramda";

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

import Svg from "@/components/Svg";
import Tile from "@/components/Tile";
import TileFilters from "@/components/TileFilters";

import { tiles } from "@/data";
import useKnownGames from "@/hooks/useKnownGames";
import { useIntParam, useRangeParam, useStringParam } from "@/util/query";
import { mergeKnownTiles, tileUsage } from "@/util/tiles";

const PER_PAGE = 50;

const getRevenues = (entries) =>
  reduce(
    ([minRevenue, maxRevenue], { tile }) => {
      if (!tile.values) {
        // No values on this tile, just return
        return [minRevenue, maxRevenue];
      }

      let [minTile, maxTile] = reduce(
        ([minRevenue, maxRevenue], value) => {
          if (value?.value === null || value?.value === undefined) {
            return [minRevenue, maxRevenue];
          }
          return [
            min(minRevenue, parseInt(value.value)),
            max(maxRevenue, parseInt(value.value)),
          ];
        },
        [Number.MAX_SAFE_INTEGER, 0],
        tile.values,
      );

      return [min(minRevenue, minTile), max(maxRevenue, maxTile)];
    },
    [Number.MAX_SAFE_INTEGER, 0],
    entries,
  );

// The games that use an entry: its own slugs, or the games using its tile id
const gamesOfEntry = (entry, games, usage) =>
  entry.slugs
    ? filter(({ slug }) => entry.slugs.includes(slug), games)
    : usage[entry.id] || [];

const UsedBy = ({ games }) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  if (games.length === 0) {
    return (
      <div className="text-xs text-muted-foreground p-2">
        {t("elements.tiles.notUsed")}
      </div>
    );
  }

  return (
    <div className="text-xs p-2 text-center">
      <button
        type="button"
        className="underline"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        {t("elements.tiles.usedBy", { count: games.length })}
      </button>
      {open && (
        <ul>
          {map(
            (game) => (
              <li key={game.slug}>{game.title}</li>
            ),
            games,
          )}
        </ul>
      )}
    </div>
  );
};

const Tiles = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { games } = useKnownGames();

  const [page, setPage] = useIntParam("page", 1);
  const [color, setColor] = useStringParam("color", "all");
  const [id, setId] = useStringParam("id", "");
  const [includes, setIncludes] = useStringParam("includes", "all");
  const [gameParam] = useStringParam("game", "all");

  const entries = useMemo(() => mergeKnownTiles(tiles, games), [games]);
  const usage = useMemo(() => tileUsage(games), [games]);
  const revenues = useMemo(() => getRevenues(entries), [entries]);
  const colors = useMemo(
    () => uniq(map(({ tile }) => tile.color, entries)),
    [entries],
  );
  const gameOptions = useMemo(
    () => sortBy(({ title }) => title.toLowerCase(), games),
    [games],
  );
  // An unknown game (maybe not loaded yet) shows everything, the URL is kept
  const game = games.find(({ slug }) => slug === gameParam) ? gameParam : "all";
  const [revenue, setRevenue] = useRangeParam("revenue", revenues);

  // Changing the game starts over: the color, revenue and page of the old game
  // may not exist in the new one. This is one navigation so none is lost.
  const setGame = useCallback(
    (slug) => {
      const params = new URLSearchParams(location.search);
      params.delete("color");
      params.delete("revenue");
      params.delete("page");
      if (slug === "all") {
        params.delete("game");
      } else {
        params.set("game", encodeURIComponent(slug));
      }
      navigate({ search: params.toString() });
    },
    [location.search, navigate],
  );

  const filteredTiles = useMemo(
    () =>
      splitEvery(
        PER_PAGE,
        filter((entry) => {
          const { id: tileId, tile: t } = entry;
          if (game !== "all") {
            if (
              !gamesOfEntry(entry, games, usage).some(
                ({ slug }) => slug === game,
              )
            ) {
              return false;
            }
          }

          if (color !== "all" && t.color !== color) {
            return false;
          }

          if (id !== "" && !tileId.startsWith(id)) {
            return false;
          }

          if (includes !== "all") {
            let counts = {
              city: (t.cities || []).length,
              town: (t.towns || []).length + (t.centerTowns || []).length,
            };

            if (includes === "none" && (counts["city"] || counts["town"])) {
              return false;
            }

            if (includes === "city" && !counts["city"]) {
              return false;
            }

            if (includes === "town" && !counts["town"]) {
              return false;
            }
          }

          for (let i = 0; i < (t.values || []).length; i++) {
            let rawValue = t.values[i].value;
            if (rawValue === null || rawValue === undefined) {
              continue;
            }
            let splitValues = split(
              /\D+/,
              is(String, rawValue) ? rawValue : rawValue.toString(),
            );
            for (let j = 0; j < splitValues.length; j++) {
              let value = parseInt(splitValues[j]);

              if (value >= revenue[0] && value <= revenue[1]) {
                return true;
              }
            }
          }

          if (!t.values && 0 >= revenue[0] && 0 <= revenue[1]) {
            return true;
          }

          return false;
        }, entries),
      ),
    [revenue, color, id, includes, game, entries, usage, games],
  );

  const pageCount = filteredTiles.length;
  const effectivePage = min(pageCount, page);
  const pagedTiles = filteredTiles[effectivePage - 1] || [];
  const prevPage = max(1, effectivePage - 1);
  const nextPage = min(pageCount, effectivePage + 1);

  return (
    <div className="p-4" data-testid="tiles">
      <h1 className="text-4xl font-extrabold">{t("elements.tiles.title")}</h1>
      <p className="leading-7 my-4 text-wrap">
        {t("elements.tiles.page.description")}
      </p>
      <div className="grid place-content-center grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 max-w-7xl">
        <TileFilters
          {...{
            color,
            setColor,
            id,
            setId,
            includes,
            setIncludes,
            revenue,
            setRevenue,
            revenues,
            colors,
            game,
            setGame,
            games: gameOptions,
          }}
        />
        <div className="col-span-2 lg:col-span-3 xl:col-span-4 2xl:col-span-5 bg-muted flex flex-rows place-items-center rounded-xl border px-4 py-2">
          <Pagination>
            <PaginationContent className="w-full">
              <PaginationItem>
                <PaginationPrevious onClick={() => setPage(prevPage)} />
              </PaginationItem>
              <PaginationItem className="grow text-center">
                Page {effectivePage} of {pageCount}
              </PaginationItem>
              <PaginationItem>
                <PaginationNext onClick={() => setPage(nextPage)} />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
        {map(
          (entry) => (
            <div
              key={entry.key}
              // Labels without a font of their own inherit the print font, like in the editor
              className="checkered border rounded-xl flex flex-col items-center font-display font-bold"
            >
              <Svg
                width="200"
                height="200"
                viewBox="-100 -100 200 200"
                transform="rotate(-90)"
              >
                <Tile
                  id={entry.id}
                  gameTiles={entry.gameTiles}
                  width={150}
                  x={0}
                  y={0}
                />
              </Svg>
              <UsedBy games={gamesOfEntry(entry, games, usage)} />
            </div>
          ),
          pagedTiles,
        )}
      </div>
    </div>
  );
};

export default Tiles;
