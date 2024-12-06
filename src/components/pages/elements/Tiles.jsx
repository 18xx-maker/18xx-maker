import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import {
  filter,
  is,
  map,
  max,
  min,
  reduce,
  split,
  splitEvery,
  values,
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
import { useIntParam, useRangeParam, useStringParam } from "@/util/query";

const PER_PAGE = 50;
const revenues = reduce(
  ([minRevenue, maxRevenue], tile) => {
    if (!tile.values) {
      // No values on this tile, just return
      return [minRevenue, maxRevenue];
    }

    let [minTile, maxTile] = reduce(
      ([minRevenue, maxRevenue], value) => {
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
  values(tiles),
);

const Tiles = () => {
  const { t } = useTranslation();

  const [page, setPage] = useIntParam("page", 1);
  const [color, setColor] = useStringParam("color", "all");
  const [id, setId] = useStringParam("id", "");
  const [includes, setIncludes] = useStringParam("includes", "all");
  const [revenue, setRevenue] = useRangeParam("revenue", revenues);

  const filteredTiles = useMemo(
    () =>
      splitEvery(
        PER_PAGE,
        filter((t) => {
          if (color !== "all" && t.color !== color) {
            return false;
          }

          if (id !== "" && !t.id.startsWith(id)) {
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
        }, values(tiles)),
      ),
    [revenue, color, id, includes],
  );

  const pageCount = filteredTiles.length;
  const effectivePage = min(pageCount, page);
  const pagedTiles = filteredTiles[effectivePage - 1] || [];
  const prevPage = max(1, effectivePage - 1);
  const nextPage = min(pageCount, effectivePage + 1);

  return (
    <div className="p-4">
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
          }}
        />
        <div className="col-span-2 lg:col-span-3 xl:col-span-4 2xl:col-span-5 bg-muted flex flex-rows place-items-center rounded-xl border px-4 py-2">
          <Pagination>
            <PaginationContent className="w-full">
              <PaginationItem>
                <PaginationPrevious onClick={() => setPage(prevPage)} />
              </PaginationItem>
              <PaginationItem className="flex-grow text-center">
                Page {effectivePage} of {pageCount}
              </PaginationItem>
              <PaginationItem>
                <PaginationNext onClick={() => setPage(nextPage)} />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
        {map(
          (t) => (
            <div
              key={t.id}
              className="checkered border rounded-xl flex flex-col items-center"
            >
              <Svg
                width="200"
                height="200"
                viewBox="-100 -100 200 200"
                transform="rotate(-90)"
              >
                <Tile id={t.id} width={150} x={0} y={0} />
              </Svg>
            </div>
          ),
          pagedTiles,
        )}
      </div>
    </div>
  );
};

export default Tiles;
