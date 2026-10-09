import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import { Combobox } from "@/components/ui/combobox";

import {
  FieldShell,
  useDraft,
  useField,
} from "@/components/schemaForm/SchemaField";

import { icons, logos, publishers } from "@/data";

export const ASSETS = { icon: icons, logo: logos, publisher: publishers };

// The name of an icon, a logo or a publisher: the ones of the app as suggestions, any other
// name stays as typed (a game can bring its own), with a hint
const AssetPicker = ({ keys, schema, asset }) => {
  const { t } = useTranslation();
  const field = useField(keys, schema);
  const names = useMemo(() => Object.keys(ASSETS[asset]).sort(), [asset]);
  const options = useMemo(
    () =>
      names.map((value) => ({
        value,
        ...(asset === "publisher" && { label: publishers[value].name }),
      })),
    [names, asset],
  );
  const draft = useDraft(field.value, (text) =>
    text.trim() === "" ? field.clear() : field.set(text.trim()),
  );
  const unknown =
    typeof field.value === "string" && !names.includes(field.value);
  const aria = field.aria();
  const hint = `${field.id}-unknown`;

  return (
    <FieldShell {...field}>
      <Combobox
        {...aria}
        aria-describedby={
          [aria["aria-describedby"], unknown && hint]
            .filter(Boolean)
            .join(" ") || undefined
        }
        options={options}
        value={draft.text}
        onValueChange={draft.change}
        onSelect={(option) => {
          draft.change(option.value);
          field.set(option.value);
        }}
        onEnter={draft.commit}
        onBlur={draft.commit}
        emptyText={t("editPanel.tokenEditor.noAssets", {
          value: draft.text,
          asset: t(`editPanel.tokenEditor.assets.${asset}`),
        })}
      />
      {unknown && (
        <p id={hint} className="text-xs text-warning-text">
          {t("editPanel.tokenEditor.unknownAsset", {
            value: field.value,
            asset: t(`editPanel.tokenEditor.assets.${asset}`),
          })}
        </p>
      )}
    </FieldShell>
  );
};

export default AssetPicker;
