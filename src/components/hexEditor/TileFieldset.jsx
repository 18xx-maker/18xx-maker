import { useTranslation } from "react-i18next";

import { HEX_PROPERTIES, TILE_FIELDS } from "@/components/hexEditor/hexSchema";
import SchemaField from "@/components/schemaForm/SchemaField";

// The fields of a tile about printing it (how many there are, how many are
// printed, the sheet group), in the form context of a hex editor. An alias
// also has the tile it is drawn as.
const TileFieldset = ({ alias = false }) => {
  const { t } = useTranslation();
  return (
    <fieldset className="flex flex-col gap-4 rounded-md border p-3">
      <legend className="px-1 text-sm font-semibold">
        {t("hexEditor.tile.printing")}
      </legend>
      {alias && (
        <SchemaField keys={["hex", "tile"]} schema={HEX_PROPERTIES.tile} />
      )}
      {TILE_FIELDS.map((key) => (
        <SchemaField
          key={key}
          keys={["hex", key]}
          schema={HEX_PROPERTIES[key]}
        />
      ))}
    </fieldset>
  );
};

export default TileFieldset;
