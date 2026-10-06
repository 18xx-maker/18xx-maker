import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Copy,
  Plus,
  Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";

import Color from "@/components/Color";
import resolveCellColor from "@/components/market/resolveCellColor";
import { SchemaFormContext } from "@/components/schemaForm/SchemaField";
import { pointerOf } from "@/components/schemaForm/resolve";

import { cn } from "@/util/cn";
import { normalizeCell } from "@/util/market";
import {
  blankRow,
  cellKeys,
  clampCell,
  columnCells,
  columnCount,
  duplicateColumn,
  duplicateRow,
  emptiedRows,
  insertColumn,
  insertRow,
  isFlat,
  moveColumn,
  moveRow,
  removeColumn,
  removeRow,
  rowsOf,
  setCell,
} from "@/util/marketEdit";

const ARROWS = { up: "↑", down: "↓", left: "←", right: "→" };

const cellText = (cell) => {
  const object = normalizeCell(cell);
  if (!object) return "";
  return "value" in object ? String(object.value) : String(object.label ?? "");
};

// How a cell is called: by its row and column, or the cell of a flat market. A
// column of a 1Diag market is two cells, on top and below.
export const placeName = (t, stock, row, col) => {
  if (stock.type === "1Diag")
    return t(
      col % 2 === 0
        ? "editPanel.market.positionDiagTop"
        : "editPanel.market.positionDiagBottom",
      { column: Math.floor(col / 2) + 1 },
    );
  return isFlat(stock.type)
    ? t("editPanel.market.positionFlat", { column: col + 1 })
    : t("editPanel.market.position", { row: row + 1, column: col + 1 });
};

const IconButton = ({ label, disabled, onClick, children, ...props }) => (
  <Button
    type="button"
    variant="outline"
    size="icon"
    className="max-md:size-11 size-8 gap-0"
    aria-label={label}
    title={label}
    disabled={disabled}
    onClick={onClick}
    {...props}
  >
    {children}
  </Button>
);

const Add = ({ children }) => (
  <span className="flex flex-row items-center">
    <Plus className="size-3!" />
    {children}
  </span>
);

// Rows or columns of the market: what to do with the one of the selected cell
const Toolbar = ({ label, items }) => (
  <div
    role="group"
    aria-label={label}
    className="flex flex-row flex-wrap items-center gap-1"
  >
    <span className="mr-1 text-xs text-muted-foreground" aria-hidden="true">
      {label}
    </span>
    {items.map(({ name, ...item }) => (
      <IconButton key={name} data-action={name} {...item} />
    ))}
  </div>
);

// The cells of the market as a grid. An arrow key moves to the next cell and
// selects it, Delete empties a cell, a digit goes to the value of the cell.
// The rows are as long as they are (a market is often a triangle), so the
// indexes are set on every row and cell. A 1Diag market is drawn as the
// market page does: two rows, the second half a cell to the right.
const MarketGrid = ({ stock, selected, select, announce }) => {
  const form = useContext(SchemaFormContext);
  const { t } = useTranslation();
  const grid = useRef(null);
  const focus = useRef(null);
  const [removed, setRemoved] = useState(null);

  const type = stock.type;
  const flat = isFlat(type);
  const diag = type === "1Diag";
  const size = diag ? 2 : 1;
  const rows = rowsOf(stock);
  const columns = columnCount(stock);
  const empty = rows.every((row) => row.length === 0);
  const current = selected;
  const first = clampCell(stock, { row: 0, col: 0 });

  // The place of the cells that have a problem
  const problems = useMemo(() => {
    const pointers = (form.issues ?? [])
      .map((issue) => issue.pointer)
      .filter((pointer) => pointer.startsWith("stock.market"));
    return (row, col) => {
      const pointer = pointerOf(cellKeys(stock, row, col));
      return pointers.some(
        (p) =>
          p === pointer ||
          p.startsWith(`${pointer}.`) ||
          p.startsWith(`${pointer}[`),
      );
    };
  }, [form.issues, stock]);

  // The focus follows the place the last action selected, once it is there
  useEffect(() => {
    if (!focus.current) return;
    const { row, col } = focus.current;
    focus.current = null;
    grid.current
      ?.querySelector(`[data-row="${row}"][data-col="${col}"]`)
      ?.focus();
  });

  const pick = (place, move = true) => {
    const next = clampCell(form.latest().stock, place);
    select(next);
    if (move && next) focus.current = next;
  };

  const act = (fn, place, message, undo = null) => {
    // What is typed in a field is passed on before the grid changes
    document.activeElement?.blur?.();
    form.edit(fn);
    setRemoved(undo);
    pick(place);
    announce(message);
  };

  const { row = 0, col = 0 } = current ?? {};
  const column = Math.floor(col / size);
  const place = (r, c) => ({ row: r, col: c });
  const rowNumber = row + 1;
  const columnNumber = column + 1;
  const names = { row: rowNumber, column: columnNumber };

  const rowActions = {
    add: (offset) =>
      act(
        (g) => insertRow(g, row + offset, blankRow(g.stock, row)),
        place(row + offset, col),
        t("editPanel.market.addedRow", { row: row + offset + 1 }),
      ),
    move: (delta) =>
      act(
        (g) => moveRow(g, row, row + delta),
        place(row + delta, col),
        t("editPanel.market.movedRow", {
          row: row + delta + 1,
          count: rows.length,
        }),
      ),
    duplicate: () =>
      act(
        (g) => duplicateRow(g, row),
        place(row + 1, col),
        t("editPanel.market.duplicatedRow", { row: rowNumber }),
      ),
    remove: () =>
      act(
        (g) => removeRow(g, row),
        place(row, col),
        t("editPanel.market.removedRow", { row: rowNumber }),
        {
          kind: "row",
          index: row,
          row: structuredClone(form.latest().stock.market[row]),
          col,
        },
      ),
  };

  const columnPlace = (k) => place(row, k * size + (col % size));
  const columnActions = {
    add: (offset) =>
      act(
        (g) => insertColumn(g, column + offset),
        columnPlace(column + offset),
        t("editPanel.market.addedColumn", { column: column + offset + 1 }),
      ),
    move: (delta) =>
      act(
        (g) => moveColumn(g, column, column + delta),
        columnPlace(column + delta),
        t("editPanel.market.movedColumn", {
          column: column + delta + 1,
          count: columns,
        }),
      ),
    duplicate: () =>
      act(
        (g) => duplicateColumn(g, column),
        columnPlace(column + 1),
        t("editPanel.market.duplicatedColumn", { column: columnNumber }),
      ),
    remove: () =>
      act(
        (g) => removeColumn(g, column),
        columnPlace(column),
        t("editPanel.market.removedColumn", { column: columnNumber }),
        {
          kind: "column",
          index: column,
          cells: structuredClone(columnCells(form.latest().stock, column)),
          rows: emptiedRows(form.latest().stock, column),
          col,
        },
      ),
  };

  const undo = () => {
    if (!removed) return;
    const { kind, index } = removed;
    document.activeElement?.blur?.();
    form.edit((g) =>
      kind === "row"
        ? insertRow(g, index, removed.row)
        : insertColumn(
            // The rows the removal emptied come back before their cells
            removed.rows.reduce((game, at) => insertRow(game, at, []), g),
            index,
            removed.cells,
          ),
    );
    setRemoved(null);
    pick(
      kind === "row"
        ? place(index, removed.col)
        : place(row, index * size + (removed.col % size)),
    );
    announce(
      t(`editPanel.market.restored${kind === "row" ? "Row" : "Column"}`),
    );
  };

  // The cell next to one in the direction of the key, if there is one
  const neighbor = (key) => {
    const length = rows[row]?.length ?? 0;
    const vertical = (delta) => {
      const target = rows[row + delta];
      return target?.length
        ? place(row + delta, Math.min(col, target.length - 1))
        : undefined;
    };
    switch (key) {
      case "ArrowLeft":
        return col - size >= 0 ? place(row, col - size) : undefined;
      case "ArrowRight":
        return col + size < length ? place(row, col + size) : undefined;
      case "ArrowUp":
        if (diag) return col % 2 === 1 ? place(row, col - 1) : undefined;
        return flat ? undefined : vertical(-1);
      case "ArrowDown":
        if (diag)
          return col % 2 === 0 && col + 1 < length
            ? place(row, col + 1)
            : undefined;
        return flat ? undefined : vertical(1);
      case "Home":
        return place(row, diag ? col % 2 : 0);
      case "End":
        return place(
          row,
          Math.max(
            0,
            length - 1 - (diag && (length - 1) % 2 !== col % 2 ? 1 : 0),
          ),
        );
      default:
        return undefined;
    }
  };

  const onKeyDown = (event) => {
    if (!event.target.closest?.('[role="gridcell"]') || !current) return;
    if (event.ctrlKey || event.metaKey || event.altKey) return;

    // The keys of the grid are the grid's, not the page's (a digit would go to
    // a section of the game)
    const own =
      neighbor(event.key) ||
      ["Delete", "Backspace", "Enter"].includes(event.key) ||
      /^[0-9]$/.test(event.key);
    if (own) event.stopPropagation();

    const next = neighbor(event.key);
    if (next) {
      event.preventDefault();
      pick(next);
    } else if (event.key === "Delete" || event.key === "Backspace") {
      event.preventDefault();
      form.edit((g) => setCell(g, row, col, null));
    } else if (event.key === "Enter") {
      event.preventDefault();
      document.querySelector("[data-inspector] input")?.focus();
    } else if (/^[0-9]$/.test(event.key)) {
      // The digit goes on into the value field, replacing what is there
      const input = document.querySelector("[data-inspector] input");
      input?.focus();
      input?.select();
    }
  };

  const cellName = (r, c, cell) => {
    const object = normalizeCell(cell) ?? {};
    const text = cellText(cell) || t("editPanel.market.cellEmpty");
    const where = placeName(t, stock, r, c);
    return [
      `${where}: ${text}`,
      object.par && t("editPanel.market.cellPar"),
      Number.isInteger(object.legend) &&
        t("editPanel.market.cellLegend", { number: object.legend }),
      object.arrow && [object.arrow].flat().join(" "),
      problems(r, c) && t("editPanel.market.cellProblem"),
    ]
      .filter(Boolean)
      .join(", ");
  };

  const data = {
    cell: stock.cell,
    legend: stock.legend ?? [],
    par: stock.par,
  };

  const renderCell = (c, tc, r, k, cell) => {
    const object = normalizeCell(cell);
    const isSelected = current?.row === r && current?.col === k;
    const color = object ? resolveCellColor(object, data, c) : undefined;
    const filled =
      object &&
      (object.color ||
        object.par ||
        Number.isInteger(object.legend) ||
        stock.cell?.color);
    const arrows = object?.arrow ? [object.arrow].flat() : [];

    return (
      <div
        key={k}
        role="gridcell"
        aria-colindex={(diag ? Math.floor(k / 2) : k) + (flat ? 1 : 2)}
        aria-selected={isSelected}
        aria-label={cellName(r, k, cell)}
        tabIndex={
          isSelected || (!current && first?.row === r && first?.col === k)
            ? 0
            : -1
        }
        data-row={r}
        data-col={k}
        onClick={() => pick(place(r, k), false)}
        onFocus={() => !isSelected && pick(place(r, k), false)}
        style={
          filled ? { backgroundColor: color, color: tc(color) } : undefined
        }
        className={cn(
          "relative flex h-9 min-w-11 shrink-0 box-border cursor-pointer select-none items-center justify-center rounded-sm border px-1 text-xs font-medium tabular-nums max-md:h-11 max-md:min-w-12",
          !filled &&
            (object ? "bg-background" : "border-dashed text-muted-foreground"),
          isSelected &&
            "ring-2 ring-primary ring-offset-1 ring-offset-background",
          "focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary",
        )}
      >
        <span aria-hidden="true">{cellText(cell)}</span>
        {arrows.length > 0 && (
          <span aria-hidden="true" className="ml-0.5">
            {arrows.map((a) => ARROWS[a]).join("")}
          </span>
        )}
        {object?.par && (
          <span
            aria-hidden="true"
            className="absolute left-0.5 top-0 text-[9px] font-bold leading-none"
          >
            P
          </span>
        )}
        {Number.isInteger(object?.legend) && (
          <span
            aria-hidden="true"
            className="absolute right-0.5 top-0 text-[9px] font-bold leading-none"
          >
            {object.legend}
          </span>
        )}
        {problems(r, k) && (
          <span
            aria-hidden="true"
            className="absolute -right-1 -top-1 flex size-3.5 items-center justify-center rounded-full bg-destructive text-[9px] font-bold text-destructive-foreground"
          >
            !
          </span>
        )}
      </div>
    );
  };

  // The rows as drawn: the cells with their place in the market
  const drawn = diag
    ? [0, 1].map((r) =>
        (rows[0] ?? [])
          .map((cell, k) => ({ cell, k, r: 0 }))
          .filter(({ k }) => k % 2 === r),
      )
    : rows.map((row, r) => row.map((cell, k) => ({ cell, k, r })));

  const none = current === null;

  return (
    <div className="flex flex-col gap-3">
      <p id="market-grid-hint" className="text-xs text-muted-foreground">
        {t("editPanel.market.gridHint")}
      </p>
      {diag && (
        <p className="text-xs text-muted-foreground">
          {t("editPanel.market.diagNote")}
        </p>
      )}
      {removed && (
        <p className="flex flex-row flex-wrap items-center gap-2 rounded-md border bg-muted px-3 py-2 text-sm">
          <span>
            {t(
              removed.kind === "row"
                ? "editPanel.market.removedRow"
                : "editPanel.market.removedColumn",
              { row: removed.index + 1, column: removed.index + 1 },
            )}
          </span>
          <Button type="button" variant="outline" size="sm" onClick={undo}>
            {t("editPanel.undo")}
          </Button>
        </p>
      )}
      {empty ? (
        <div className="flex flex-col items-start gap-2">
          <p className="text-sm text-muted-foreground">
            {t("editPanel.market.noCells")}
          </p>
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              act(
                (g) => (flat ? insertColumn(g, 0) : insertRow(g, 0, [null])),
                place(0, 0),
                t(
                  flat
                    ? "editPanel.market.addedColumn"
                    : "editPanel.market.addedRow",
                  { row: 1, column: 1 },
                ),
              )
            }
          >
            <Plus />
            {t(flat ? "editPanel.market.addColumn" : "editPanel.market.addRow")}
          </Button>
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-2">
            {!flat && (
              <Toolbar
                label={t("editPanel.market.row")}
                items={[
                  {
                    name: "add-above",
                    label: t("editPanel.market.addRowAbove"),
                    disabled: none,
                    onClick: () => rowActions.add(0),
                    children: (
                      <Add>
                        <ArrowUp className="size-3.5" />
                      </Add>
                    ),
                  },
                  {
                    name: "add-below",
                    label: t("editPanel.market.addRowBelow"),
                    disabled: none,
                    onClick: () => rowActions.add(1),
                    children: (
                      <Add>
                        <ArrowDown className="size-3.5" />
                      </Add>
                    ),
                  },
                  {
                    name: "move-up",
                    label: t("editPanel.market.moveRowUp", names),
                    disabled: none || row === 0,
                    onClick: () => rowActions.move(-1),
                    children: <ArrowUp />,
                  },
                  {
                    name: "move-down",
                    label: t("editPanel.market.moveRowDown", names),
                    disabled: none || row === rows.length - 1,
                    onClick: () => rowActions.move(1),
                    children: <ArrowDown />,
                  },
                  {
                    name: "duplicate",
                    label: t("editPanel.market.duplicateRow", names),
                    disabled: none,
                    onClick: rowActions.duplicate,
                    children: <Copy />,
                  },
                  {
                    name: "remove",
                    label: t("editPanel.market.removeRow", names),
                    disabled: none,
                    onClick: rowActions.remove,
                    children: <Trash2 />,
                  },
                ]}
              />
            )}
            <Toolbar
              label={t("editPanel.market.column")}
              items={[
                {
                  name: "add-left",
                  label: t("editPanel.market.addColumnLeft"),
                  disabled: none,
                  onClick: () => columnActions.add(0),
                  children: (
                    <Add>
                      <ArrowLeft className="size-3.5" />
                    </Add>
                  ),
                },
                {
                  name: "add-right",
                  label: t("editPanel.market.addColumnRight"),
                  disabled: none,
                  onClick: () => columnActions.add(1),
                  children: (
                    <Add>
                      <ArrowRight className="size-3.5" />
                    </Add>
                  ),
                },
                {
                  name: "move-left",
                  label: t("editPanel.market.moveColumnLeft", names),
                  disabled: none || column === 0,
                  onClick: () => columnActions.move(-1),
                  children: <ArrowLeft />,
                },
                {
                  name: "move-right",
                  label: t("editPanel.market.moveColumnRight", names),
                  disabled: none || column === columns - 1,
                  onClick: () => columnActions.move(1),
                  children: <ArrowRight />,
                },
                {
                  name: "duplicate",
                  label: t("editPanel.market.duplicateColumn", names),
                  disabled: none,
                  onClick: columnActions.duplicate,
                  children: <Copy />,
                },
                {
                  name: "remove",
                  label: t("editPanel.market.removeColumn", names),
                  disabled: none,
                  onClick: columnActions.remove,
                  children: <Trash2 />,
                },
              ]}
            />
          </div>
          <Color>
            {(c, tc) => (
              <div
                ref={grid}
                role="grid"
                aria-label={t("editPanel.market.gridLabel")}
                aria-describedby="market-grid-hint"
                aria-rowcount={drawn.length}
                aria-colcount={columns + (flat ? 0 : 1)}
                onKeyDown={onKeyDown}
                data-testid="market-grid"
                className="overflow-x-auto rounded-md border p-2"
              >
                <div className="flex w-max min-w-full flex-col gap-0.5">
                  {drawn.map((cells, index) => (
                    <div
                      key={index}
                      role="row"
                      aria-rowindex={index + 1}
                      className={cn(
                        "flex flex-row gap-0.5",
                        diag && index === 1 && "ml-[22px]",
                      )}
                    >
                      {!flat && (
                        <span
                          role="rowheader"
                          aria-colindex={1}
                          className="flex w-5 shrink-0 items-center justify-end pr-1 text-[10px] text-muted-foreground"
                        >
                          {index + 1}
                        </span>
                      )}
                      {cells.map(({ cell, k, r }) =>
                        renderCell(c, tc, r, k, cell),
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Color>
        </>
      )}
    </div>
  );
};

export default MarketGrid;
