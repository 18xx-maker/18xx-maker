import { useContext } from "react";
import { useTranslation } from "react-i18next";

import { Checkbox } from "@/components/ui/checkbox";

import SchemaField, {
  ChoiceField,
  FieldShell,
  SchemaFormContext,
  useField,
} from "@/components/schemaForm/SchemaField";
import SchemaFormProvider from "@/components/schemaForm/SchemaFormProvider";
import { issueText } from "@/components/schemaForm/issueText";
import {
  BORDER_PRIMARY_KEYS,
  BORDER_TEXT_PRIMARY_KEYS,
  MAP_KEYS,
  issuesFor,
  valueAt,
} from "@/components/schemaForm/resolve";

import schema from "@/schemas/game.schema.json";
import { variationMap } from "@/util/hexEdit";
import { useIntParam } from "@/util/query";

const mapSchema = schema.definitions.map.properties;

// What a new border, line or border text starts with: a valid item the map can
// draw (the schema wants two points, a border text a coordinate)
const POINTS = ["A1p1", "A1p4"];
const LIST_FIELDS = {
  borders: {
    primary: BORDER_PRIMARY_KEYS,
    titleKeys: ["color"],
    defaults: { color: "black", coords: POINTS },
  },
  lines: {
    primary: BORDER_PRIMARY_KEYS,
    titleKeys: ["color"],
    defaults: { color: "black", coords: POINTS },
  },
  borderTexts: {
    primary: BORDER_TEXT_PRIMARY_KEYS,
    titleKeys: ["label", "cost", "color"],
    defaults: { coord: "A1p0", label: "1" },
  },
};

// Objects whose name would read as another tab
const LEGENDS = {
  market: "editPanel.headings.mapMarket",
  players: "editPanel.headings.mapPlayers",
};

// The title schema only allows false: one checkbox, checked for false and
// unset for the default
const HideTitle = ({ keys }) => {
  const { t } = useTranslation();
  const field = useField(keys, mapSchema.title);
  return (
    <FieldShell {...field} label={t("editPanel.map.hideTitle")}>
      <Checkbox
        id={field.id}
        checked={field.value === false}
        onCheckedChange={(on) =>
          on === true ? field.set(false) : field.clear()
        }
      />
    </FieldShell>
  );
};

// The other variations of a map as the choices of copy, by index
const CopyField = ({ keys, variation }) => {
  const { t } = useTranslation();
  const form = useContext(SchemaFormContext);
  const maps = form.game.map;
  const current = valueAt(keys, form.game);
  const options = maps.flatMap((_, index) =>
    index === variation ? [] : [index],
  );
  if (current !== undefined && !options.includes(current))
    options.push(current);

  return (
    <ChoiceField
      keys={keys}
      schema={mapSchema.copy}
      options={options}
      label={t("editPanel.map.copy")}
      labelOf={(index) => maps[index]?.name ?? index + 1}
    />
  );
};

const MapFields = ({ variation }) => {
  const { t } = useTranslation();
  const form = useContext(SchemaFormContext);
  const { game, issues } = form;
  const array = Array.isArray(game.map);
  const base = array ? ["map", variation] : ["map"];
  const copy = valueAt([...base, "copy"], game);
  const source = array && copy !== undefined ? game.map[copy] : undefined;
  const root = issuesFor(issues, base, false);

  return (
    <div className="flex flex-col gap-4">
      {root.map((issue, index) => (
        <p key={index} role="alert" className="text-xs text-destructive">
          {issueText(t, issue)}
        </p>
      ))}
      {source && (
        <p role="note" className="text-sm">
          {t("editPanel.map.inherited", {
            variation: source.name ?? copy + 1,
          })}
        </p>
      )}
      {MAP_KEYS.map((key) => {
        const keys = [...base, key];
        if (key === "copy") {
          return array ? (
            <CopyField key={key} keys={keys} variation={variation} />
          ) : null;
        }
        if (key === "remove" && copy === undefined) return null;
        if (key === "title") return <HideTitle key={key} keys={keys} />;
        return (
          <SchemaField
            key={key}
            keys={keys}
            schema={mapSchema[key]}
            legend={LEGENDS[key]}
            {...LIST_FIELDS[key]}
          />
        );
      })}
    </div>
  );
};

// The Map tab: what a variation of the map has besides its hexes (those are
// the Hex tab's), generated from the game schema. It follows ?variation=.
const MapForm = ({ game }) => {
  const [variation] = useIntParam("variation", 0);
  if (!variationMap(game, variation)) return null;

  return (
    <SchemaFormProvider game={game}>
      <MapFields key={variation} variation={variation} />
    </SchemaFormProvider>
  );
};

export default MapForm;
