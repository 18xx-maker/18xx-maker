import { useId, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSelector, useStore } from "react-redux";

import { Copy, Plus, Trash2, WandSparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import LazyHexEditor from "@/components/hexEditor/LazyHexEditor";

import { tiles as library } from "@/data";
import { useSelectedTile } from "@/hooks/useSelectedTile";
import { editGame, selectGameProblems } from "@/state";
import { cn } from "@/util/cn";
import { rerootPointer } from "@/util/hexEdit";
import {
  addTile,
  customizeTile,
  duplicateTile,
  effectiveTile,
  hasTile,
  privatesUsing,
  removeTile,
  renameTile,
  setTile,
  tileFields,
  tileIds,
  tileShape,
  writeTile,
} from "@/util/tileEdit";

// A few words that tell the tiles apart in the list
const detail = (entry) => {
  const shape = tileShape(entry);
  const quantity = shape === "quantity" ? entry : (entry.quantity ?? 1);
  const what =
    shape === "alias"
      ? `= ${entry.tile}`
      : shape === "definition"
        ? entry.color
        : "";
  return [`× ${quantity}`, what].filter(Boolean).join(" ");
};

// A form of one text field and one button: Enter sends it. The field is a
// draft until then; the error is the one of the last try.
const IdForm = ({ label, button, initial = "", onSubmit, icon, error }) => {
  const [text, setText] = useState(initial);
  const id = useId();
  return (
    <form
      className="flex flex-col gap-1"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit(text);
      }}
    >
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <div className="flex flex-row gap-2">
        <Input
          id={id}
          value={text}
          onChange={(event) => setText(event.target.value)}
          aria-invalid={error ? true : undefined}
          autoComplete="off"
          spellCheck={false}
        />
        <Button type="submit" variant="outline" className="shrink-0">
          {icon}
          {button}
        </Button>
      </div>
      {error && (
        <p role="alert" className="text-xs text-destructive">
          {error}
        </p>
      )}
    </form>
  );
};

// The Tiles tab: the tiles of the game, to add, copy, rename and remove, and
// the one picked (?tile=26%7CT2) with its editor. An entry that is drawn from
// the library (a quantity, an alias or an override) only has the fields of its
// printing until it is customized: a tile of the library is never edited in
// place. Every change is one editGame, and the entry keeps the shape it has.
const TilesSection = ({ game }) => {
  const { t } = useTranslation();
  const store = useStore();
  const { tile, select, clear } = useSelectedTile();
  const [status, setStatus] = useState("");
  const [errors, setErrors] = useState({});
  const slug = game.meta.slug;
  const allIssues = useSelector((state) => selectGameProblems(state, slug));
  const checked = useSelector(
    (state) => state.gameProblems.status !== "running",
  );

  const ids = tileIds(game);
  const id = hasTile(game, tile) ? tile : "";
  const entry = id ? game.tiles[id] : undefined;
  const shape = id ? tileShape(entry) : undefined;

  const issues = useMemo(() => {
    if (!id || !allIssues || !checked) return [];
    return allIssues.flatMap((issue) => {
      const pointer = rerootPointer(issue.pointer, `tiles.${id}`);
      return pointer === null ? [] : [{ ...issue, pointer }];
    });
  }, [allIssues, checked, id]);

  // Runs a change of the game as it is now: fn gives { game, id } or { error }.
  // One edit, or the error under the form named by `where`.
  const change = (where, fn, done) => {
    const current = store.getState().game;
    const result = fn(current);
    if (result.error) {
      setErrors({ [where]: t(`editPanel.tiles.errors.${result.error}`) });
      return false;
    }
    setErrors({});
    store.dispatch(
      editGame((latest) => (latest === current ? result.game : latest)),
    );
    if (done) setStatus(done(result));
    return result;
  };

  const add = (text) => {
    const result = change(
      "add",
      (g) => addTile(g, text, library),
      (r) => t("editPanel.tiles.added", { id: r.id }),
    );
    if (result) select(result.id);
  };

  const rename = (text) => {
    const to = text.trim();
    const result = change(
      "rename",
      (g) => renameTile(g, id, to),
      () => t("editPanel.tiles.renamed", { from: id, to }),
    );
    if (result && to !== id) select(to);
  };

  const duplicate = () => {
    const result = change(
      "tile",
      (g) => duplicateTile(g, id),
      (r) => t("editPanel.tiles.duplicated", { id, copy: r.id }),
    );
    if (result) select(result.id);
  };

  const remove = () => {
    const result = change(
      "tile",
      (g) => ({ game: removeTile(g, id) }),
      () => t("editPanel.tiles.removed", { id }),
    );
    if (result) clear();
  };

  const customize = () =>
    change(
      "tile",
      (g) => customizeTile(g, id, library),
      () => t("editPanel.tiles.customized", { id }),
    );

  // The fields of the editor go to the entry as it is now, in its own shape
  const write = (next) =>
    store.dispatch(
      editGame((latest) => {
        if (!hasTile(latest, id)) return latest;
        const written = writeTile(latest.tiles[id], next);
        return written === latest.tiles[id]
          ? latest
          : setTile(latest, id, written);
      }),
    );

  const used = id ? privatesUsing(game, id).length : 0;
  const preview = id ? effectiveTile(game, id, library) : undefined;
  const orientation = 0;

  return (
    <div className="flex flex-col gap-4" data-testid="tiles-section">
      <IdForm
        label={t("editPanel.tiles.addLabel")}
        button={t("editPanel.tiles.add")}
        icon={<Plus />}
        onSubmit={add}
        error={errors.add}
      />
      <p role="status" aria-live="polite" className="sr-only">
        {status}
      </p>

      {ids.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {t("editPanel.tiles.empty")}
        </p>
      ) : (
        <ul
          aria-label={t("editPanel.tiles.list")}
          className="flex max-h-56 flex-col gap-1 overflow-y-auto"
        >
          {ids.map((key) => (
            <li key={key}>
              <button
                type="button"
                aria-pressed={key === id}
                onClick={() => select(key === id ? "" : key)}
                className={cn(
                  "flex w-full flex-row items-baseline gap-2 rounded-md border px-3 py-1.5 text-left text-sm font-medium focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring",
                  key === id && "border-primary bg-accent",
                )}
              >
                <span className="truncate">{key}</span>{" "}
                <span
                  className={cn(
                    "truncate text-xs font-normal",
                    key === id ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  {detail(game.tiles[key])}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {ids.length > 0 && !id && (
        <p className="text-sm text-muted-foreground">
          {t("editPanel.tiles.hint")}
        </p>
      )}

      {id && (
        <section
          aria-label={t("editPanel.tiles.tile", { id })}
          data-testid="tile-editor"
          className="flex flex-col gap-4 rounded-md border p-3"
        >
          <h3 className="text-sm font-semibold">
            {t("editPanel.tiles.tile", { id })}
            <span className="ml-2 text-xs font-normal text-muted-foreground">
              {t(`editPanel.tiles.shapes.${shape}`, { tile: entry?.tile })}
            </span>
          </h3>

          <IdForm
            key={id}
            label={t("editPanel.tiles.idLabel")}
            button={t("editPanel.tiles.rename")}
            initial={id}
            onSubmit={rename}
            error={errors.rename}
          />
          {used > 0 && (
            <p role="note" className="text-xs text-muted-foreground">
              {t("editPanel.tiles.usedBy", { count: used })}
            </p>
          )}

          <div className="flex flex-row flex-wrap gap-2">
            <Button type="button" variant="outline" onClick={duplicate}>
              <Copy />
              {t("editPanel.tiles.duplicate")}
            </Button>
            {shape !== "definition" && preview && (
              <Button type="button" variant="outline" onClick={customize}>
                <WandSparkles />
                {t("editPanel.tiles.customize")}
              </Button>
            )}
            <Button type="button" variant="outline" onClick={remove}>
              <Trash2 />
              {t("editPanel.tiles.remove")}
            </Button>
          </div>
          {errors.tile && (
            <p role="alert" className="text-xs text-destructive">
              {errors.tile}
            </p>
          )}

          {shape !== "definition" && (
            <p className="text-sm text-muted-foreground">
              {preview
                ? t("editPanel.tiles.fromLibrary")
                : t("editPanel.tiles.noLibrary", { id })}
            </p>
          )}
          <LazyHexEditor
            key={`${slug}:${id}`}
            value={shape === "definition" ? entry : tileFields(entry)}
            onChange={write}
            orientation={orientation}
            game={game}
            issues={issues}
            tile
            library={shape !== "definition"}
            preview={preview}
            alias={shape === "alias"}
          />
        </section>
      )}
    </div>
  );
};

export default TilesSection;
