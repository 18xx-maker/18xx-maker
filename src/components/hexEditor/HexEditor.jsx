import { useState } from "react";
import { useTranslation } from "react-i18next";

import { TooltipProvider } from "@/components/ui/tooltip";

import ElementList from "@/components/hexEditor/ElementList";
import HexCanvas from "@/components/hexEditor/HexCanvas";
import SidePicker from "@/components/hexEditor/SidePicker";
import {
  NEW_ELEMENT,
  addElement,
  addTrack,
  countOf,
  duplicateElement,
  elementAt,
  isSingle,
  moveElement,
  removeElement,
  removedSides,
  toggleRemovedBorder,
} from "@/components/hexEditor/hexModel";
import { HEX_PROPERTIES } from "@/components/hexEditor/hexSchema";
import { inspectorFor } from "@/components/hexEditor/inspectors";
import { useHexForm } from "@/components/hexEditor/useHexForm";
import SchemaField, {
  ChoiceField,
  SchemaFormContext,
} from "@/components/schemaForm/SchemaField";

// The colors of a hex of the map
export const HEX_COLORS = [
  "plain",
  "offboard",
  "mountain",
  "water",
  "land",
  "yellow",
  "green",
  "brown",
  "gray",
  "orange",
  "red",
];

// Edits one hex, a group of the map: a drawing of it with a button on each
// edge, the list of what is drawn on it, and the fields of the element that is
// picked. The value is the hex as the game file has it, onChange gets the hex
// with the change made. Nothing else is written (no defaults, the keys it does
// not know stay as they are). game is the game, for the fields that name things
// in it; orientation the turn of the hexes of the map (90 for vertical hexes);
// issues the problems of the hex, with pointers into it.
const HexEditor = ({ value, onChange, orientation = 0, game, issues }) => {
  const { t } = useTranslation();
  const form = useHexForm({ value, onChange, game, issues });
  const [picked, setPicked] = useState(null);
  const [pending, setPending] = useState(null);
  const [status, setStatus] = useState("");

  // What was picked may be gone (removed from the JSON, or by the game)
  const selected =
    picked && elementAt(value, picked.key, picked.index) !== undefined
      ? picked
      : null;
  const hexChange = (fn) => form.edit((g) => ({ hex: fn(g.hex) }));
  const nameOf = (key, index) =>
    countOf(value, key) > 1 && !isSingle(key)
      ? `${t(`hexEditor.form.elements.${key}`)} ${index + 1}`
      : t(`hexEditor.form.elements.${key}`);

  const edge = (side) => {
    if (pending === null) {
      setPending(side);
      setStatus(t("hexEditor.form.pendingStatus", { side }));
    } else if (pending === side) {
      setPending(null);
      setStatus(t("hexEditor.form.cancelledStatus"));
    } else {
      const from = pending;
      hexChange((hex) => addTrack(hex, from, side));
      setPicked({ key: "track", index: countOf(value, "track") });
      setPending(null);
      setStatus(t("hexEditor.form.addedTrack", { from, to: side }));
    }
  };

  const add = (key) => {
    hexChange((hex) => addElement(hex, key, structuredClone(NEW_ELEMENT[key])));
    setPicked({ key, index: countOf(value, key) });
    setStatus(
      t("hexEditor.form.added", { name: t(`hexEditor.form.elements.${key}`) }),
    );
  };

  const remove = (key, index) => {
    hexChange((hex) => removeElement(hex, key, index));
    setPicked(null);
    setStatus(t("hexEditor.form.removed", { name: nameOf(key, index) }));
  };

  const move = (key, from, to) => {
    hexChange((hex) => moveElement(hex, key, from, to));
    if (selected?.key === key && selected.index === from) {
      setPicked({ key, index: to });
    }
  };

  const duplicate = (key, index) => {
    hexChange((hex) => duplicateElement(hex, key, index));
    setPicked({ key, index: index + 1 });
    setStatus(t("hexEditor.form.duplicated", { name: nameOf(key, index) }));
  };

  const Inspector = selected ? inspectorFor(selected.key) : null;
  const colorSchema = HEX_PROPERTIES.color;
  const colors =
    typeof value.color === "string" && !HEX_COLORS.includes(value.color)
      ? [...HEX_COLORS, value.color]
      : HEX_COLORS;

  return (
    <SchemaFormContext.Provider value={form}>
      <TooltipProvider delayDuration={200}>
        <div
          className="flex flex-col gap-4"
          data-testid="hex-editor"
          onKeyDown={(event) => {
            if (event.key === "Escape" && pending !== null) {
              event.stopPropagation();
              event.nativeEvent.stopImmediatePropagation?.();
              setPending(null);
              setStatus(t("hexEditor.form.cancelledStatus"));
            }
          }}
        >
          <div className="flex flex-col items-center gap-1">
            <div className="w-full max-w-64">
              <HexCanvas
                value={value}
                orientation={orientation}
                selected={selected}
                onSelect={setPicked}
                pending={pending}
                onEdge={edge}
                elementLabel={nameOf}
              />
            </div>
            <p className="min-h-4 text-xs text-muted-foreground">
              {pending === null
                ? t("hexEditor.form.canvasHint")
                : t("hexEditor.form.pendingStatus", { side: pending })}
            </p>
            <p role="status" aria-live="polite" className="sr-only">
              {status}
            </p>
          </div>

          <ElementList
            hex={value}
            selected={selected}
            onSelect={setPicked}
            onAdd={add}
            onMove={move}
            onDuplicate={duplicate}
            onRemove={remove}
          />

          {Inspector && (
            <section
              className="flex flex-col gap-3 rounded-md border p-3"
              aria-label={t("hexEditor.form.inspector", {
                name: nameOf(selected.key, selected.index),
              })}
              data-testid="hex-inspector"
            >
              <h3 className="text-sm font-semibold">
                {nameOf(selected.key, selected.index)}
              </h3>
              <Inspector
                key={`${selected.key}:${selected.index}`}
                elementKey={selected.key}
                index={selected.index}
                element={elementAt(value, selected.key, selected.index)}
                orientation={orientation}
              />
            </section>
          )}

          <fieldset className="flex flex-col gap-4 rounded-md border p-3">
            <legend className="px-1 text-sm font-semibold">
              {t("hexEditor.form.hex")}
            </legend>
            <ChoiceField
              keys={["hex", "color"]}
              schema={colorSchema}
              options={colors}
              label={t("hexEditor.form.color")}
            />
            <SchemaField keys={["hex", "half"]} schema={HEX_PROPERTIES.half} />
            <SchemaField
              keys={["hex", "stripeRotation"]}
              schema={HEX_PROPERTIES.stripeRotation}
            />
            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium">
                {t("hexEditor.form.removeBorders")}
              </span>
              <SidePicker
                label={t("hexEditor.form.removeBorders")}
                sideLabel={(side) => t("hexEditor.form.sideN", { side })}
                value={removedSides(value)}
                orientation={orientation}
                onChange={(sides) => {
                  const side = [
                    ...sides.filter((s) => !removedSides(value).includes(s)),
                    ...removedSides(value).filter((s) => !sides.includes(s)),
                  ][0];
                  if (side !== undefined) {
                    hexChange((hex) => toggleRemovedBorder(hex, side));
                  }
                }}
              />
            </div>
          </fieldset>
        </div>
      </TooltipProvider>
    </SchemaFormContext.Provider>
  );
};

export default HexEditor;
