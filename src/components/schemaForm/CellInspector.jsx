import { useContext, useId, useMemo } from "react";
import { useTranslation } from "react-i18next";

import { assocPath, equals, path as getIn } from "ramda";

import { ChevronDown, ChevronRight, TriangleAlert } from "lucide-react";

import { Button } from "@/components/ui/button";

import SchemaField, {
  SchemaFormContext,
} from "@/components/schemaForm/SchemaField";
import { issueText } from "@/components/schemaForm/issueText";
import { issuesFor } from "@/components/schemaForm/resolve";

import schema from "@/schemas/game.schema.json";
import {
  cellAt,
  cellKeys,
  promoteCell,
  setCell,
  setCellField,
} from "@/util/marketEdit";

const fields = schema.definitions.cellObject.properties;
const PRIMARY = ["value", "label", "color", "legend", "par"];
const ARROWS = ["up", "down", "left", "right"];

// The arrow of a cell: a direction is a string, several are a list
const ArrowField = ({ keys, value, onChange }) => {
  const { t } = useTranslation();
  const id = useId();
  const chosen = value === undefined ? [] : [value].flat();

  const toggle = (arrow) => {
    const next = chosen.includes(arrow)
      ? chosen.filter((a) => a !== arrow)
      : [...chosen, arrow];
    onChange(
      next.length === 0 ? undefined : next.length === 1 ? next[0] : next,
    );
  };

  return (
    <div
      role="group"
      aria-labelledby={id}
      className="flex flex-col gap-1"
      data-testid={`field-${keys.at(-1)}`}
    >
      <span id={id} className="text-sm font-medium">
        {t("editPanel.market.arrows")}
      </span>
      <div className="flex flex-row flex-wrap gap-2">
        {ARROWS.map((arrow) => (
          <Button
            key={arrow}
            type="button"
            variant={chosen.includes(arrow) ? "default" : "outline"}
            size="sm"
            aria-pressed={chosen.includes(arrow)}
            onClick={() => toggle(arrow)}
          >
            {t(`editPanel.market.directions.${arrow}`)}
          </Button>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        {fields.arrow.description}
      </p>
    </div>
  );
};

// The fields of the selected cell, from the cellObject of the schema. The
// fields work on the cell as an object: a number, a string or null is shown as
// the object it stands for, and an edit saves the shortest form again (a cell
// of only a value is that number).
const CellInspector = ({ stock, row, col, heading, more, onMore }) => {
  const form = useContext(SchemaFormContext);
  const { t } = useTranslation();
  const cell = cellAt(stock, row, col);
  const keys = cellKeys(stock, row, col);
  const object = promoteCell(cell);

  const view = useMemo(
    () => assocPath(keys, object, form.game),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [form.game, row, col],
  );

  const change = (key, value) =>
    form.edit((g) => {
      const current = cellAt(g.stock, row, col);
      if (current === undefined) return g;
      if (equals(promoteCell(current)[key], value)) return g;
      return setCell(g, row, col, setCellField(current, key, value));
    });

  const context = {
    ...form,
    game: view,
    set: (ks, value) => change(ks.at(-1), value),
    clear: (ks) => change(ks.at(-1), undefined),
  };

  const issues = issuesFor(form.issues, keys, false);
  const legend = stock.legend ?? [];
  const warnings = [
    Number.isInteger(object.legend) &&
      object.legend >= legend.length &&
      t("editPanel.market.legendMissing", { index: object.legend }),
    object.par === true && !stock.par && t("editPanel.market.parMissing"),
  ].filter(Boolean);
  const shorthand = cell === null || typeof cell !== "object";

  const field = (key) =>
    key === "arrow" ? (
      <ArrowField
        key={key}
        keys={[...keys, key]}
        value={getIn(["arrow"], object)}
        onChange={(value) => change("arrow", value)}
      />
    ) : (
      <SchemaField key={key} keys={[...keys, key]} schema={fields[key]} />
    );

  return (
    <SchemaFormContext.Provider value={context}>
      <div
        data-inspector
        data-testid="cell-inspector"
        className="flex flex-col gap-4 rounded-md border p-3"
      >
        <h3 className="text-sm font-semibold">{heading}</h3>
        {shorthand && (
          <p className="text-xs text-muted-foreground">
            {t("editPanel.market.shorthand", {
              as: JSON.stringify(cell),
            })}
          </p>
        )}
        {issues.map((issue, index) => (
          <p key={index} role="alert" className="text-xs text-destructive">
            {issueText(t, issue)}
          </p>
        ))}
        {warnings.map((warning) => (
          <p
            key={warning}
            className="flex flex-row items-center gap-1 text-xs text-warning-text"
          >
            <TriangleAlert className="size-3.5 shrink-0" aria-hidden="true" />
            {warning}
          </p>
        ))}
        {PRIMARY.map(field)}
        <button
          type="button"
          className="flex flex-row items-center gap-1 self-start rounded-sm text-sm text-muted-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
          aria-expanded={more}
          onClick={() => onMore(!more)}
        >
          {more ? (
            <ChevronDown className="size-4" aria-hidden="true" />
          ) : (
            <ChevronRight className="size-4" aria-hidden="true" />
          )}
          {t("editPanel.moreFields")}
        </button>
        {more &&
          Object.keys(fields)
            .filter((key) => !PRIMARY.includes(key))
            .map(field)}
      </div>
    </SchemaFormContext.Provider>
  );
};

export default CellInspector;
