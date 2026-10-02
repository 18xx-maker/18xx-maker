import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { createAlert } from "@/state";
import { exportDefaults, exportPages, planExport } from "@/util/exportPlan";

const FORMATS = ["pdf", "png", "b18"];

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
  const [paginated, setPaginated] = useState(initial.paginated);
  const [dpi, setDpi] = useState(String(initial.dpi));
  const [version, setVersion] = useState(initial.b18.version);
  const [author, setAuthor] = useState(initial.b18.author);
  const [out, setOut] = useState();
  const [running, setRunning] = useState(false);

  const files = formats.some((format) => format !== "b18");
  const dpiValid = /^\d+$/.test(dpi) && dpi >= 1 && dpi <= MAX_DPI;
  const dpiError = formats.includes("png") && !dpiValid;
  const problem =
    (formats.length === 0 && t("export.noFormat")) ||
    (files && docs.length === 0 && t("export.noDocuments"));

  const chooseFolder = async () => {
    const folder = await window.api.chooseExportFolder();
    if (folder) setOut(folder);
  };

  const run = async () => {
    setRunning(true);
    try {
      const result = await window.api.export({
        ...planExport(game, layers, {
          formats,
          docs,
          layouts: layoutsAll ? "all" : "current",
          paginated,
          dpi: Number(dpiValid ? dpi : MAX_DPI),
          b18: { version, author },
        }),
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
            <div className="flex items-center gap-2">
              <Switch
                id="export-paginated"
                checked={paginated}
                disabled={running || !formats.includes("pdf")}
                onCheckedChange={setPaginated}
              />
              <Label htmlFor="export-paginated">{t("export.paginated")}</Label>
            </div>
          </fieldset>

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
          <Button
            disabled={
              running ||
              !!problem ||
              dpiError ||
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
