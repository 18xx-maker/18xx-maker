import { useTranslation } from "react-i18next";

import { map } from "ramda";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const FilterSelect = ({ id, label, value, onChange, options }) => {
  const { t } = useTranslation();

  return (
    <div className="w-48">
      <Label htmlFor={id} className="mr-2">
        {label}
      </Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id={id}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t("games.filter.all")}</SelectItem>
          {map(
            ([optionValue, optionLabel]) => (
              <SelectItem key={optionValue} value={optionValue}>
                {optionLabel}
              </SelectItem>
            ),
            options,
          )}
        </SelectContent>
      </Select>
    </div>
  );
};

const GameFilters = ({
  publisher,
  setPublisher,
  publishers,
  designer,
  setDesigner,
  designers,
  type,
  setType,
  showType,
}) => {
  const { t } = useTranslation();

  return (
    <div className="bg-muted flex flex-wrap flex-row gap-4 rounded-xl border px-4 py-2 mt-6">
      <FilterSelect
        id="game-filter-publisher"
        label={t("games.filter.publisher")}
        value={publisher}
        onChange={setPublisher}
        options={publishers}
      />
      <FilterSelect
        id="game-filter-designer"
        label={t("games.filter.designer")}
        value={designer}
        onChange={setDesigner}
        options={map((d) => [d, d], designers)}
      />
      {showType && (
        <FilterSelect
          id="game-filter-type"
          label={t("games.filter.type")}
          value={type}
          onChange={setType}
          options={[
            ["bundled", t("games.filter.bundled")],
            ["loaded", t("games.filter.loaded")],
          ]}
        />
      )}
    </div>
  );
};

export default GameFilters;
