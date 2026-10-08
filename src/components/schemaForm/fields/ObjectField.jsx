import { useContext } from "react";
import { useTranslation } from "react-i18next";

import SchemaField from "@/components/schemaForm/SchemaField";
import { SchemaFormContext } from "@/components/schemaForm/fields/shared";
import { issueText } from "@/components/schemaForm/issueText";
import {
  humanize,
  isHidden,
  isUnsetDeprecated,
  issuesFor,
} from "@/components/schemaForm/resolve";
import { useSchemaText } from "@/components/schemaForm/schemaText";

// legend is the translation key of the title, when the name of the field is not
// it (the market position of a map reads as the Market tab)
export const ObjectField = ({ keys, schema, legend }) => {
  const form = useContext(SchemaFormContext);
  const { t } = useTranslation();
  const text = useSchemaText();
  const issues = issuesFor(form.issues, keys, false);

  return (
    <fieldset className="flex flex-col gap-4 rounded-md border p-3">
      <legend className="px-1 text-sm font-semibold">
        {legend ? t(legend) : humanize(keys[keys.length - 1])}
      </legend>
      {schema.description && (
        <p className="-mt-2 text-xs text-muted-foreground">
          {text(schema.description)}
        </p>
      )}
      {issues.map((issue, index) => (
        <p key={index} role="alert" className="text-xs text-destructive">
          {issueText(t, issue)}
        </p>
      ))}
      {Object.entries(schema.properties)
        .filter(
          ([key, child]) =>
            !isHidden([...keys, key]) &&
            !isUnsetDeprecated([...keys, key], child, form.root, form.game),
        )
        .map(([key, child]) => (
          <SchemaField key={key} keys={[...keys, key]} schema={child} />
        ))}
    </fieldset>
  );
};
