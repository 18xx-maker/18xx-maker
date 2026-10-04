import { useState } from "react";
import { useTranslation } from "react-i18next";

import { map } from "ramda";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";

const TileFilters = ({
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
  games,
}) => {
  const { t } = useTranslation();
  // The range being dragged, otherwise the one in the URL
  const [dragging, setDragging] = useState(null);
  const revenueSlider = dragging || revenue;

  const handleRevenueCommit = (values) => {
    setRevenue(values);
    setDragging(null);
  };
  const handleRevenue = (values) => setDragging(values);

  return (
    <div className="col-span-2 lg:col-span-3 xl:col-span-4 2xl:col-span-5 bg-muted flex flex-wrap flex-row gap-4 rounded-xl border px-4 py-2">
      <div className="w-40">
        <Label htmlFor="tile-filter-game" className="mr-2">
          {t("elements.tiles.filter.game")}
        </Label>
        <Select value={game} onValueChange={setGame}>
          <SelectTrigger id="tile-filter-game">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem key="all" value="all">
              {t("elements.tiles.filter.allGames")}
            </SelectItem>
            {map(
              (g) => (
                <SelectItem key={g.slug} value={g.slug}>
                  {g.title}
                </SelectItem>
              ),
              games,
            )}
          </SelectContent>
        </Select>
      </div>
      <div className="w-40">
        <Label htmlFor="tile-filter-color" className="mr-2">
          {t("elements.tiles.filter.color")}
        </Label>
        <Select value={color} onValueChange={setColor}>
          <SelectTrigger id="tile-filter-color">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem key="all" value="all">
              {t("elements.tiles.filter.all")}
            </SelectItem>
            {map(
              (c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ),
              colors,
            )}
          </SelectContent>
        </Select>
      </div>
      <div className="w-16">
        <Label htmlFor="tile-filter-id" className="text-nowrap mr-2">
          {t("elements.tiles.filter.id")}
        </Label>
        <Input
          id="tile-filter-id"
          defaultValue={id}
          onChange={(e) => setId(e.target.value)}
        />
      </div>
      <div className="w-40">
        <Label htmlFor="tile-filter-includes" className="text-nowrap mr-2">
          {t("elements.tiles.filter.includes")}
        </Label>
        <Select value={includes} onValueChange={setIncludes}>
          <SelectTrigger id="tile-filter-includes">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">
              {t("elements.tiles.filter.all")}
            </SelectItem>
            <SelectItem value="none">
              {t("elements.tiles.filter.none")}
            </SelectItem>
            <SelectItem value="town">
              {t("elements.tiles.filter.town")}
            </SelectItem>
            <SelectItem value="city">
              {t("elements.tiles.filter.city")}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="w-64">
        <Label htmlFor="tile-filter-revenues" className="mr-2">
          {t("elements.tiles.filter.revenues")}
        </Label>
        <div className="flex flex-row gap-4">
          <span>{revenueSlider[0]}</span>
          <Slider
            id="tile-filter-revenues"
            value={revenueSlider}
            onValueChange={handleRevenue}
            onValueCommit={handleRevenueCommit}
            step={10}
            min={revenues[0]}
            max={revenues[1]}
            marks={[
              { value: 0, label: "∅" },
              { value: 20, label: "20" },
              { value: 40, label: "40" },
              { value: 60, label: "60" },
              { value: 100, label: "100" },
              { value: revenues[1], label: revenues[1] },
            ]}
          />
          <span>{revenueSlider[1]}</span>
        </div>
      </div>
    </div>
  );
};
export default TileFilters;
