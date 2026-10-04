import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";

import { MAX_DPI } from "@/export/capture.js";
import { BACKGROUNDS, MAX_CARD_BLEED } from "@/export/options.js";
import { createAlert } from "@/state";
import { exportDefaults, exportPages, planExport } from "@/util/exportPlan";

const FORMATS = ["pdf", "png", "svg", "b18"];

const Field = ({ id, label, description, error, children }) => (
  <div className="flex flex-col gap-1">
    <Label htmlFor={id}>{label}</Label>
    {children}
    {description && (
      <p id={`${id}-description`} className="text-sm text-muted-foreground">
        {description}
      </p>
    )}
    {error && (
      <p id={`${id}-error`} role="alert" className="text-sm text-error">
        {error}
      </p>
    )}
  </div>
);

// The value of the variation select that is every variation
const ALL = "all";

const toggle = (list, item, on) =>
  on ? [...list, item] : list.filter((value) => value !== item);

// The options of an export of the game, and the export: the files are planned
// here (only while the panel is open) and exported by the main process (window.api.export), which answers
// when it is over. layers is { defaultConfig, userConfig, storedConfig }.
const ExportOptions = ({ game, layers, open, onOpenChange }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const pages = exportPages(game, layers);

  // The options start as the game's `exports` and the defaults say
  const [initial] = useState(() => exportDefaults(game, layers));
  const [formats, setFormats] = useState(initial.formats);
  const [docs, setDocs] = useState(initial.docs);
  const [layoutsAll, setLayoutsAll] = useState(initial.layouts === "all");
  const [variation, setVariation] = useState(
    initial.variation === null ? ALL : String(initial.variation),
  );
  const [dpi, setDpi] = useState(String(initial.dpi));
  const [cardBleed, setCardBleed] = useState(String(initial.cardBleed));
  const [background, setBackground] = useState(initial.background);
  const [version, setVersion] = useState(initial.b18.version);
  const [author, setAuthor] = useState(initial.b18.author);
  const [out, setOut] = useState();
  const [running, setRunning] = useState(false);

  const variations = Array.isArray(game.map) && game.map.length > 1;

  // Back to what the game file says, what the options start as
  const reset = () => {
    setFormats(initial.formats);
    setDocs(initial.docs);
    setLayoutsAll(initial.layouts === "all");
    setVariation(initial.variation === null ? ALL : String(initial.variation));
    setDpi(String(initial.dpi));
    setCardBleed(String(initial.cardBleed));
    setBackground(initial.background);
    setVersion(initial.b18.version);
    setAuthor(initial.b18.author);
  };

  const files = formats.some((format) => format !== "b18");
  const dpiValid = /^\d+$/.test(dpi) && dpi >= 1 && dpi <= MAX_DPI;
  const dpiError = formats.includes("png") && !dpiValid;
  const bleedValid =
    cardBleed.trim() !== "" &&
    Number(cardBleed) >= 0 &&
    Number(cardBleed) <= MAX_CARD_BLEED;
  const bleedError = formats.includes("png") && !bleedValid;
  const options = () => ({
    formats,
    docs,
    layouts: layoutsAll ? "all" : "current",
    variation: variation === ALL ? null : Number(variation),
    dpi: Number(dpiValid ? dpi : MAX_DPI),
    cardBleed: bleedValid ? Number(cardBleed) : initial.cardBleed,
    background,
    b18: { version, author },
  });
  // How many files the choice exports, to tell when it is none (an svg of
  // pages that have no svg)
  const count = useMemo(
    () =>
      open && formats.length > 0
        ? planExport(game, layers, {
            formats,
            docs,
            layouts: layoutsAll ? "all" : "current",
            variation: variation === ALL ? null : Number(variation),
          }).jobs.length
        : null,
    [game, layers, open, formats, docs, layoutsAll, variation],
  );
  const problem =
    (formats.length === 0 && t("export.noFormat")) ||
    (files && docs.length === 0 && t("export.noDocuments")) ||
    (count === 0 && t("export.noFiles"));

  const chooseFolder = async () => {
    const folder = await window.api.chooseExportFolder();
    if (folder) setOut(folder);
  };

  const run = async () => {
    setRunning(true);
    try {
      const result = await window.api.export({
        ...planExport(game, layers, options()),
        out,
      });
      // A dialog that was cancelled leaves the options open
      if (!(result.cancelled && result.total === 0)) onOpenChange(false);
    } catch (error) {
      dispatch(createAlert(t("export.failed"), error.message, "error"));
    } finally {
      setRunning(false);
    }
  };

  return (
    <Sheet
      open={open}
      // Its cancel button is in here, so it stays while an export runs
      onOpenChange={(next) =>
        running && !next ? undefined : onOpenChange(next)
      }
    >
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>
            {t("export.optionsTitle", { title: game.info.title })}
          </SheetTitle>
          <SheetDescription>{t("export.optionsDescription")}</SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-6 py-4">
          <fieldset className="flex flex-col gap-2">
            <legend className="font-medium mb-2">{t("export.formats")}</legend>
            {FORMATS.map((format) => (
              <div key={format} className="flex items-center gap-2">
                <Checkbox
                  id={`export-format-${format}`}
                  checked={formats.includes(format)}
                  disabled={running}
                  onCheckedChange={(on) =>
                    setFormats(toggle(formats, format, on === true))
                  }
                />
                <Label htmlFor={`export-format-${format}`}>
                  {t(`export.format.${format}`)}
                </Label>
              </div>
            ))}
          </fieldset>

          <fieldset
            className="flex flex-col gap-2"
            aria-describedby="export-documents-description"
          >
            <legend className="font-medium mb-1">
              {t("export.documents")}
            </legend>
            <p
              id="export-documents-description"
              className="text-sm text-muted-foreground mb-1"
            >
              {t("export.documentsDescription")}
            </p>
            {pages.map((page) => (
              <div key={page} className="flex items-center gap-2">
                <Checkbox
                  id={`export-doc-${page}`}
                  checked={docs.includes(page)}
                  disabled={running || !files}
                  onCheckedChange={(on) =>
                    setDocs(toggle(docs, page, on === true))
                  }
                />
                <Label htmlFor={`export-doc-${page}`}>
                  {t(`game.nav.${page}`)}
                </Label>
              </div>
            ))}
            <div className="flex items-center gap-2 mt-2">
              <Switch
                id="export-layouts"
                checked={layoutsAll}
                disabled={running || !files}
                onCheckedChange={setLayoutsAll}
              />
              <Label htmlFor="export-layouts">{t("export.allLayouts")}</Label>
            </div>
          </fieldset>

          {variations && (
            <Field id="export-variation" label={t("export.variation")}>
              <Select
                value={variation}
                disabled={running}
                onValueChange={setVariation}
              >
                <SelectTrigger id="export-variation">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL}>
                    {t("export.allVariations")}
                  </SelectItem>
                  {game.map.map((variant, i) => (
                    <SelectItem key={i} value={String(i)}>
                      {variant.name ||
                        t("export.variationNumber", { n: i + 1 })}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          )}

          <Field
            id="export-dpi"
            label={t("export.dpi")}
            description={t("export.dpiDescription", { max: MAX_DPI })}
            error={dpiError && t("export.dpiError", { max: MAX_DPI })}
          >
            <Input
              id="export-dpi"
              type="number"
              inputMode="numeric"
              min={1}
              max={MAX_DPI}
              value={dpi}
              disabled={running || !formats.includes("png")}
              aria-invalid={dpiError}
              aria-describedby={
                dpiError
                  ? "export-dpi-description export-dpi-error"
                  : "export-dpi-description"
              }
              onChange={(event) => setDpi(event.target.value)}
            />
          </Field>

          <Field
            id="export-card-bleed"
            label={t("export.cardBleed")}
            description={t("export.cardBleedDescription", {
              max: MAX_CARD_BLEED,
            })}
            error={
              bleedError && t("export.cardBleedError", { max: MAX_CARD_BLEED })
            }
          >
            <Input
              id="export-card-bleed"
              type="number"
              inputMode="decimal"
              min={0}
              max={MAX_CARD_BLEED}
              step="any"
              value={cardBleed}
              disabled={running || !formats.includes("png")}
              aria-invalid={bleedError}
              aria-describedby={
                bleedError
                  ? "export-card-bleed-description export-card-bleed-error"
                  : "export-card-bleed-description"
              }
              onChange={(event) => setCardBleed(event.target.value)}
            />
          </Field>

          <Field
            id="export-background"
            label={t("export.background")}
            description={t("export.backgroundDescription")}
          >
            <Select
              value={background}
              disabled={running || !formats.includes("png")}
              onValueChange={setBackground}
            >
              <SelectTrigger
                id="export-background"
                aria-describedby="export-background-description"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {BACKGROUNDS.map((value) => (
                  <SelectItem key={value} value={value}>
                    {t(`export.${value}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          {formats.includes("b18") && (
            <>
              <Field id="export-b18-version" label={t("export.b18Version")}>
                <Input
                  id="export-b18-version"
                  value={version}
                  disabled={running}
                  onChange={(event) => setVersion(event.target.value)}
                />
              </Field>
              <Field id="export-b18-author" label={t("export.b18Author")}>
                <Input
                  id="export-b18-author"
                  value={author}
                  disabled={running}
                  onChange={(event) => setAuthor(event.target.value)}
                />
              </Field>
            </>
          )}

          <div className="flex flex-col gap-2">
            <span className="font-medium" id="export-destination">
              {t("export.destination")}
            </span>
            <p className="text-sm break-all" aria-live="polite">
              {out || t("export.destinationAsk")}
            </p>
            <Button
              variant="outline"
              aria-describedby="export-destination"
              disabled={running}
              onClick={chooseFolder}
            >
              {t("export.chooseFolder")}
            </Button>
          </div>

          {problem && (
            <p role="alert" className="text-sm text-error">
              {problem}
            </p>
          )}
        </div>

        <SheetFooter className="gap-2">
          {running && (
            <Button variant="outline" onClick={() => window.api.cancelExport()}>
              {t("export.cancel")}
            </Button>
          )}
          <Button variant="outline" disabled={running} onClick={reset}>
            {t("export.reset")}
          </Button>
          <Button
            disabled={
              running ||
              !!problem ||
              dpiError ||
              bleedError ||
              (formats.includes("b18") && (!version || !author))
            }
            onClick={run}
          >
            {running ? t("export.running") : t("export.run")}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default ExportOptions;
