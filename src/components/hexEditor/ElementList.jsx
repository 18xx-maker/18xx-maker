import { useTranslation } from "react-i18next";

import { ArrowDown, ArrowUp, Copy, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  ADDABLE_KEYS,
  countOf,
  elementsOf,
  isSingle,
  trackEnds,
} from "@/components/hexEditor/hexModel";

import { cn } from "@/util/cn";

// A few words that tell the elements of a kind apart
const detail = (key, element) => {
  if (element === null || typeof element !== "object") return String(element);
  if (key === "track") return trackEnds(element).join("-");
  const text = element.label ?? element.value ?? element.type ?? element.size;
  if (text !== undefined && typeof text !== "object") return String(text);
  const name = element.name;
  return typeof name === "string" ? name : name?.name;
};

const ItemButton = ({ label, onClick, disabled, children }) => (
  <Button
    type="button"
    variant="ghost"
    size="icon"
    className="size-7"
    aria-label={label}
    disabled={disabled}
    onClick={onClick}
  >
    {children}
  </Button>
);

// What is drawn on the hex, one row for each element: pick it, move it, copy
// it, take it away. Below, a choice that adds a new one.
const ElementList = ({
  hex,
  selected,
  onSelect,
  onAdd,
  onMove,
  onDuplicate,
  onRemove,
}) => {
  const { t } = useTranslation();
  const elements = elementsOf(hex);
  const name = (key, index) =>
    isSingle(key) || countOf(hex, key) === 1
      ? t(`hexEditor.form.elements.${key}`)
      : `${t(`hexEditor.form.elements.${key}`)} ${index + 1}`;

  return (
    <div className="flex flex-col gap-2">
      {elements.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {t("hexEditor.form.empty")}
        </p>
      ) : (
        <ul
          className="flex flex-col gap-1"
          aria-label={t("hexEditor.form.elementsLabel")}
        >
          {elements.map(({ key, index, element }) => {
            const on = selected?.key === key && selected?.index === index;
            const title = name(key, index);
            const extra = detail(key, element);
            const names = { name: title };
            return (
              <li
                key={`${key}-${index}`}
                data-element={`${key}:${index}`}
                className={cn(
                  "flex flex-row items-center justify-between gap-1 rounded-md border pl-3",
                  on && "border-primary bg-accent",
                )}
              >
                <button
                  type="button"
                  className="flex min-w-0 flex-1 flex-row items-baseline gap-2 py-2 text-left text-sm font-medium focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
                  aria-pressed={on}
                  onClick={() => onSelect(on ? null : { key, index })}
                >
                  <span className="truncate">{title}</span>
                  {extra && (
                    <span className="truncate text-xs font-normal text-muted-foreground">
                      {extra}
                    </span>
                  )}
                </button>
                <div className="flex shrink-0 flex-row">
                  {!isSingle(key) && (
                    <>
                      <ItemButton
                        label={t("hexEditor.form.moveUp", names)}
                        disabled={index === 0}
                        onClick={() => onMove(key, index, index - 1)}
                      >
                        <ArrowUp />
                      </ItemButton>
                      <ItemButton
                        label={t("hexEditor.form.moveDown", names)}
                        disabled={index === countOf(hex, key) - 1}
                        onClick={() => onMove(key, index, index + 1)}
                      >
                        <ArrowDown />
                      </ItemButton>
                      <ItemButton
                        label={t("hexEditor.form.duplicate", names)}
                        onClick={() => onDuplicate(key, index)}
                      >
                        <Copy />
                      </ItemButton>
                    </>
                  )}
                  <ItemButton
                    label={t("hexEditor.form.remove", names)}
                    onClick={() => onRemove(key, index)}
                  >
                    <Trash2 />
                  </ItemButton>
                </div>
              </li>
            );
          })}
        </ul>
      )}
      <Select value="" onValueChange={onAdd}>
        <SelectTrigger aria-label={t("hexEditor.form.add")}>
          <SelectValue placeholder={t("hexEditor.form.add")} />
        </SelectTrigger>
        <SelectContent>
          {ADDABLE_KEYS.filter(
            (key) => !isSingle(key) || countOf(hex, key) === 0,
          ).map((key) => (
            <SelectItem key={key} value={key}>
              {t(`hexEditor.form.elements.${key}`)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default ElementList;
