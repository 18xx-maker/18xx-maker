import { useContext, useState } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";

import {
  FieldShell,
  SchemaFormContext,
  useField,
} from "@/components/schemaForm/SchemaField";
import { valueAt } from "@/components/schemaForm/resolve";
import TokenEditorDialog from "@/components/tokenEditor/TokenEditorDialog";
import TokenPreview from "@/components/tokenEditor/TokenPreview";
import { tokenToObject } from "@/components/tokenEditor/tokenModel";

// What the editor needs to know of the place of the token: the company of a
// company token, the name the dialog is titled with and whether a token that
// has only a label is text (the list of tokens)
const placeOf = (source, keys, game) => {
  const owner =
    source === "game" ? undefined : valueAt(keys.slice(0, -1), game);
  return {
    company: source === "company" ? owner : undefined,
    subject:
      source === "company"
        ? [owner?.name, owner?.abbrev].filter(Boolean).join(" ")
        : source === "private"
          ? owner?.name
          : undefined,
    bare: source === "game",
  };
};

const useEditor = (keys, source, subject) => {
  const form = useContext(SchemaFormContext);
  const [open, setOpen] = useState(false);
  const place = placeOf(source, keys, form.game);
  return {
    open,
    setOpen,
    place: { ...place, subject: subject ?? place.subject },
    token: tokenToObject(valueAt(keys, form.game)),
  };
};

// The field of a token on a card: its drawing and a button that opens the
// editor
export const TokenEditField = ({ keys, schema, source }) => {
  const { t } = useTranslation();
  const field = useField(keys, schema);
  const { open, setOpen, place, token } = useEditor(keys, source);

  return (
    <FieldShell {...field}>
      <Button
        {...field.aria()}
        aria-label={t("editPanel.tokenEditor.edit")}
        type="button"
        variant="outline"
        className="h-auto self-start py-2"
        onClick={() => setOpen(true)}
      >
        <TokenPreview
          source={source}
          token={token}
          company={place.company}
          className="size-10!"
          aria-hidden="true"
          data-testid="token-edit-thumbnail"
        />
        {t("editPanel.tokenEditor.edit")}
      </Button>
      <TokenEditorDialog
        open={open}
        onOpenChange={setOpen}
        keys={keys}
        schema={schema}
        source={source}
        {...place}
      />
    </FieldShell>
  );
};

// The button of an item of a list (a token of the game), with the buttons that
// move, duplicate and remove it. title names the item. The editor is not in
// the item: an item that goes from text to an object is another component,
// and would close the editor under the hand that is typing in it. The list
// that owns the item opens it (see TokensForm).
export const TokenEditItem = ({ keys, title, onOpen }) => {
  const { t } = useTranslation();
  const { token } = useEditor(keys, "game");
  const label = t("editPanel.tokenEditor.editFor", { title });

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="size-8"
      aria-label={label}
      title={label}
      data-action="edit"
      data-token-index={keys[keys.length - 1]}
      onClick={onOpen}
    >
      <TokenPreview
        source="game"
        token={token}
        className="size-6!"
        aria-hidden="true"
      />
    </Button>
  );
};
