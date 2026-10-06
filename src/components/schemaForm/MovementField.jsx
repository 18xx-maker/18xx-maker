import { useContext, useId, useState } from "react";
import { useTranslation } from "react-i18next";

import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import {
  SchemaFormContext,
  useDraft,
} from "@/components/schemaForm/SchemaField";

import { setMovement } from "@/util/marketEdit";

const DIRECTIONS = ["up", "down", "left", "right"];

const format = (lines) => (lines ?? []).join("\n");

// The texts of one key of the movement, a line for each
const Lines = ({ name, label }) => {
  const form = useContext(SchemaFormContext);
  const { t } = useTranslation();
  const id = useId();
  const lines = form.game.stock?.movement?.[name];

  const draft = useDraft(
    lines,
    (text) => form.edit((g) => setMovement(g, name, text.split("\n"))),
    format,
    // Empty lines are not kept, so what is typed can differ from the value
    (text, value) =>
      text
        .split("\n")
        .filter((l) => l.trim())
        .join("\n") === format(value),
  );

  return (
    <div className="flex flex-col gap-1">
      <Label htmlFor={id}>{label}</Label>
      <Textarea
        id={id}
        value={draft.text}
        rows={2}
        onChange={(event) => draft.change(event.target.value)}
        onBlur={draft.commit}
        aria-description={t("editPanel.market.movementLines")}
      />
    </div>
  );
};

const AddKey = () => {
  const form = useContext(SchemaFormContext);
  const { t } = useTranslation();
  const [key, setKey] = useState("");
  const [text, setText] = useState("");
  // A key that is there has its own field, adding it would replace its texts
  const exists = key.trim() in (form.game.stock?.movement ?? {});
  const ready = key.trim() !== "" && text.trim() !== "" && !exists;

  const add = () => {
    if (!ready) return;
    form.edit((g) => setMovement(g, key.trim(), [text]));
    setKey("");
    setText("");
  };

  return (
    <div className="flex flex-row flex-wrap items-end gap-2">
      <div className="flex min-w-24 flex-1 flex-col gap-1">
        <Label htmlFor="movement-new-key">{t("editPanel.market.newKey")}</Label>
        <Input
          id="movement-new-key"
          value={key}
          onChange={(event) => setKey(event.target.value)}
        />
      </div>
      <div className="flex min-w-32 flex-[2] flex-col gap-1">
        <Label htmlFor="movement-new-text">
          {t("editPanel.market.newKeyText")}
        </Label>
        <Input
          id="movement-new-text"
          value={text}
          onChange={(event) => setText(event.target.value)}
          onKeyDown={(event) => event.key === "Enter" && add()}
        />
      </div>
      <Button type="button" variant="outline" disabled={!ready} onClick={add}>
        <Plus />
        {t("editPanel.market.addKey")}
      </Button>
    </div>
  );
};

// stock.movement: texts for the four directions, and for any other key (a
// line of its own). Always saved as lists of texts. The place where it is
// drawn (stock.display.movement) is not part of it.
const MovementField = () => {
  const form = useContext(SchemaFormContext);
  const { t } = useTranslation();
  const movement = form.game.stock?.movement ?? {};
  const extras = Object.keys(movement).filter((k) => !DIRECTIONS.includes(k));

  return (
    <div className="flex flex-col gap-4">
      {DIRECTIONS.map((name) => (
        <Lines
          key={name}
          name={name}
          label={t(`editPanel.market.directions.${name}`)}
        />
      ))}
      {extras.map((name) => (
        <Lines key={name} name={name} label={name} />
      ))}
      <AddKey />
    </div>
  );
};

export default MovementField;
