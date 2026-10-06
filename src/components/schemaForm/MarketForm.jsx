import { useContext, useId, useState } from "react";
import { useTranslation } from "react-i18next";

import { ChevronDown, ChevronRight, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import CellInspector from "@/components/schemaForm/CellInspector";
import MarketGrid from "@/components/schemaForm/MarketGrid";
import MovementField from "@/components/schemaForm/MovementField";
import SchemaField, {
  FieldShell,
  JsonField,
  SchemaFormContext,
  useField,
} from "@/components/schemaForm/SchemaField";
import SchemaFormProvider from "@/components/schemaForm/SchemaFormProvider";

import schema from "@/schemas/game.schema.json";
import {
  changeType,
  clampCell,
  createMarket,
  droppedRows,
  isFlat,
  legendUses,
} from "@/util/marketEdit";

const stockSchema = schema.definitions.stock.properties;
const TYPES = stockSchema.type.enum;

// Fields that stay JSON: ledges, limits and where things are drawn
const ADVANCED = ["display", "ledges", "limits", "title"];

// A part of the form that is shown when it is opened
const Group = ({ title, children }) => {
  const [open, setOpen] = useState(false);
  const id = useId();

  return (
    <div className="rounded-md border">
      <button
        type="button"
        className="flex w-full flex-row items-center gap-1 rounded-md px-3 py-2 text-left text-sm font-semibold focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen(!open)}
      >
        {open ? (
          <ChevronDown className="size-4 shrink-0" aria-hidden="true" />
        ) : (
          <ChevronRight className="size-4 shrink-0" aria-hidden="true" />
        )}
        {title}
      </button>
      <div id={id} hidden={!open} className="flex flex-col gap-4 p-3 pt-1">
        {open && children}
      </div>
    </div>
  );
};

// stock.type. A change of it can drop rows (a flat market has one), the note
// says so and puts them back.
const TypeField = ({ announce }) => {
  const form = useContext(SchemaFormContext);
  const { t } = useTranslation();
  const field = useField(["stock", "type"], stockSchema.type);
  const [dropped, setDropped] = useState(null);

  const change = (type) => {
    const stock = form.latest().stock;
    const rows = droppedRows(stock, type);
    const before = { type: stock.type, market: structuredClone(stock.market) };
    form.edit((g) => changeType(g, type));
    setDropped(rows > 0 ? { ...before, rows } : null);
    announce(t("editPanel.market.typeChanged", { type }));
  };

  const undo = () => {
    form.edit((g) => ({
      ...g,
      stock: { ...g.stock, type: dropped.type, market: dropped.market },
    }));
    announce(t("editPanel.market.typeRestored", { type: dropped.type }));
    setDropped(null);
  };

  return (
    <FieldShell {...field} required>
      <Select value={field.value ?? ""} onValueChange={change}>
        <SelectTrigger {...field.aria({ "aria-required": true })}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {TYPES.map((type) => (
            <SelectItem key={type} value={type}>
              {type}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {dropped && (
        <p className="flex flex-row flex-wrap items-center gap-2 rounded-md border bg-muted px-3 py-2 text-sm">
          <span>
            {t("editPanel.market.rowsRemoved", {
              count: dropped.rows,
            })}
          </span>
          <Button type="button" variant="outline" size="sm" onClick={undo}>
            {t("editPanel.undo")}
          </Button>
        </p>
      )}
    </FieldShell>
  );
};

const MarketEditor = () => {
  const form = useContext(SchemaFormContext);
  const { t } = useTranslation();
  const [selection, setSelection] = useState(null);
  const [more, setMore] = useState(false);
  const [message, setMessage] = useState("");
  const stock = form.game.stock;

  const announce = (text) => setMessage(text);

  if (!Array.isArray(stock?.market)) {
    return (
      <div className="flex flex-col items-start gap-2">
        <p className="text-sm text-muted-foreground">
          {t("editPanel.market.empty")}
        </p>
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            form.edit(createMarket);
            announce(t("editPanel.market.created"));
          }}
        >
          <Plus />
          {t("editPanel.market.create")}
        </Button>
      </div>
    );
  }

  const selected = clampCell(stock, selection);
  const flat = isFlat(stock.type);
  const heading = !selected
    ? ""
    : flat
      ? t("editPanel.market.positionFlat", { column: selected.col + 1 })
      : t("editPanel.market.position", {
          row: selected.row + 1,
          column: selected.col + 1,
        });

  // Cells use a legend entry by its number: the ones after a change of the
  // list point to another entry
  const legendChange = (kind, from, to) => {
    const count =
      kind === "remove"
        ? legendUses(form.latest().stock, from, Infinity)
        : legendUses(form.latest().stock, from, to);
    return count > 0
      ? t("editPanel.market.legendAffected", { count })
      : undefined;
  };

  return (
    <div className="flex flex-col gap-4">
      <TypeField announce={announce} />
      <MarketGrid
        stock={stock}
        selected={selected}
        select={setSelection}
        announce={announce}
      />
      {selected ? (
        <CellInspector
          key={`${selected.row}-${selected.col}`}
          stock={stock}
          row={selected.row}
          col={selected.col}
          heading={heading}
          more={more}
          onMore={setMore}
        />
      ) : (
        stock.market.length > 0 && (
          <p className="text-sm text-muted-foreground">
            {t("editPanel.market.selectCell")}
          </p>
        )
      )}
      <Group title={t("editPanel.market.cellDefaults")}>
        {Object.entries(stockSchema.cell.properties).map(([key, child]) => (
          <SchemaField key={key} keys={["stock", "cell", key]} schema={child} />
        ))}
      </Group>
      <Group title={t("editPanel.market.legend")}>
        <SchemaField
          keys={["stock", "legend"]}
          schema={stockSchema.legend}
          primary={["description", "color"]}
          titleKey="description"
          unique={false}
          defaults={{ description: t("editPanel.market.newLegend") }}
          onChange={legendChange}
        />
      </Group>
      <Group title={t("editPanel.market.movement")}>
        <MovementField />
      </Group>
      <Group title={t("editPanel.market.advanced")}>
        {ADVANCED.map((key) => (
          <JsonField
            key={key}
            keys={["stock", key]}
            schema={stockSchema[key]}
          />
        ))}
      </Group>
      <p
        role="status"
        aria-live="polite"
        className="sr-only"
        data-testid="market-status"
      >
        {message}
      </p>
    </div>
  );
};

// The stock market of the game: its type, the grid of cells and a form for
// the selected cell, then the cell defaults, legend, movement and the rest
const MarketForm = ({ game }) => (
  <SchemaFormProvider game={game}>
    <MarketEditor />
  </SchemaFormProvider>
);

export default MarketForm;
