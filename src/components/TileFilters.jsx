import { useState } from "react";
import { useTranslation } from "react-i18next";

import { map, uniq, values } from "ramda";

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

import { tiles } from "@/data";

const colors = uniq(values(map((t) => t.color, tiles)));

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
}) => {
  const { t } = useTranslation();
  const [revenueSlider, setRevenueSlider] = useState(revenue);

  const handleRevenueCommit = (values) => {
    setRevenueSlider(values);
    setRevenue(values);
  };
  const handleRevenue = (values) => setRevenueSlider(values);

  return (
    <div className="col-span-2 lg:col-span-3 xl:col-span-4 2xl:col-span-5 bg-muted flex flex-wrap flex-row gap-4 rounded-xl border px-4 py-2">
      <div className="w-40">
        <Label htmlFor="tile-filter-color" className="mr-2">
          {t("elements.tiles.filter.color")}
        </Label>
        <Select
          id="tile-filter-color"
          defaultValue={color}
          onValueChange={setColor}
        >
          <SelectTrigger>
            <SelectValue value={color} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem key="all" value="all">
              All
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
        <Select
          id="tile-filters-includes"
          defaultValue={includes}
          onValueChange={setIncludes}
        >
          <SelectTrigger>
            <SelectValue value={includes} />
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
            defaultValue={revenueSlider}
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
