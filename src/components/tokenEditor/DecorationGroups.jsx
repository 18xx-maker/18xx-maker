import { useContext, useState } from "react";
import { useTranslation } from "react-i18next";

import { omit } from "ramda";

import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { SchemaFormContext } from "@/components/schemaForm/SchemaField";
import { kindOf, resolveAllOf } from "@/components/schemaForm/resolve";
import {
  activeDecorations,
  decorationCatalog,
} from "@/components/tokenEditor/tokenModel";

// The decorations of the token (a bar, stripes, a shield, halves): the ones it
// has with their properties, and a choice of the others to add. A decoration
// that is added but has no value yet (halves with no colors) stays listed
// until it is removed or the editor closes. Which ones there are, and their
// properties, come from the schema. prop(name) draws one property.
const DecorationGroups = ({ properties, token, prop }) => {
  const { t } = useTranslation();
  const form = useContext(SchemaFormContext);
  const [added, setAdded] = useState([]);
  const [choice, setChoice] = useState("");

  const catalog = decorationCatalog(properties);
  const active = activeDecorations(properties, token).map((d) => d.name);
  const shown = catalog.filter(
    (decoration) =>
      active.includes(decoration.name) || added.includes(decoration.name),
  );
  const rest = catalog.filter((decoration) => !shown.includes(decoration));
  const name = (decoration) =>
    t(`editPanel.tokenEditor.decorations.${decoration}`, {
      defaultValue: decoration,
    });

  const add = (decoration) => {
    setChoice("");
    const node = resolveAllOf(properties[decoration], form.root);
    // Where true is a value, adding is a change the preview shows at once
    if (
      kindOf(node, decoration, form.root, ["token", decoration]) ===
      "boolOrColor"
    ) {
      form.set(["token", decoration], true);
    }
    setAdded((current) => [...current, decoration]);
  };

  const remove = (decoration) => {
    setAdded((current) => current.filter((item) => item !== decoration.name));
    form.set(["token"], omit(decoration.keys, form.latest().token));
  };

  return (
    <div className="flex flex-col gap-4">
      {shown.map((decoration) => (
        <fieldset
          key={decoration.name}
          className="flex flex-col gap-3 rounded-md border p-3"
          data-decoration={decoration.name}
        >
          <legend className="px-1 text-sm font-semibold">
            {name(decoration.name)}
          </legend>
          <div className="grid gap-4 sm:grid-cols-2">
            {decoration.keys.map((key) => prop(key))}
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="self-start"
            onClick={() => remove(decoration)}
          >
            <X />
            {t("editPanel.tokenEditor.removeDecoration", {
              name: name(decoration.name),
            })}
          </Button>
        </fieldset>
      ))}
      {rest.length > 0 && (
        <Select value={choice} onValueChange={add}>
          <SelectTrigger
            className="w-full sm:w-64"
            aria-label={t("editPanel.tokenEditor.addDecoration")}
          >
            <SelectValue
              placeholder={t("editPanel.tokenEditor.addDecoration")}
            />
          </SelectTrigger>
          <SelectContent>
            {rest.map((decoration) => (
              <SelectItem key={decoration.name} value={decoration.name}>
                {name(decoration.name)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
};

export default DecorationGroups;
