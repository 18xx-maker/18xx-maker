import { useState } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

import CustomSvg from "@/components/atoms/CustomSvg";

import { customId, findDuplicate, nameProblem } from "@/util/assetNames";
import { freeName } from "@/util/dropImages";

const KINDS = ["icons", "logos"];

const Form = ({ request, onAnswer }) => {
  const { t } = useTranslation();
  const [kind, setKind] = useState(request.kind ?? null);
  const [name, setName] = useState(request.name);
  const trimmed = name.trim();
  const problem = nameProblem(trimmed);
  const clash = kind && !problem && findDuplicate(request.taken[kind], trimmed);
  const ready = kind && !problem && !clash;

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        if (ready) onAnswer({ kind, name: trimmed, replace: false });
      }}
    >
      <div className="flex flex-row items-center gap-4">
        <svg
          viewBox="-12.5 -12.5 25 25"
          className="size-24 shrink-0 rounded-md border"
          role="img"
          aria-label={t("drop.preview", { file: request.file })}
        >
          <CustomSvg
            svg={request.svg}
            x="-12.5"
            y="-12.5"
            width="25"
            height="25"
          />
        </svg>
        <div className="flex min-w-0 flex-col gap-1">
          <DialogTitle>{t("drop.title")}</DialogTitle>
          <DialogDescription className="truncate">
            {request.file}
            {request.total > 1 &&
              ` (${t("drop.progress", { index: request.index, total: request.total })})`}
          </DialogDescription>
        </div>
      </div>

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1 text-sm font-medium">{t("drop.kind")}</legend>
        {KINDS.map((option) => (
          <label key={option} className="flex flex-row items-center gap-2">
            <input
              type="radio"
              name="kind"
              value={option}
              checked={kind === option}
              onChange={() => setKind(option)}
            />
            {t(`drop.${option}`)}
          </label>
        ))}
      </fieldset>

      <label className="flex flex-col gap-1 text-sm font-medium">
        {t("drop.name")}
        <Input
          value={name}
          onChange={(event) => setName(event.target.value)}
          aria-invalid={!!problem}
        />
      </label>
      {problem && (
        <p className="text-sm text-error" role="alert">
          {t(`assets.errors.${problem}`)}
        </p>
      )}
      {clash && (
        <p className="text-sm text-warning" role="alert">
          {t("drop.exists", { id: customId(clash), kind: t(`drop.${kind}`) })}
        </p>
      )}

      <div className="flex flex-row flex-wrap justify-end gap-2">
        <Button
          type="button"
          variant="ghost"
          onClick={() => onAnswer("cancel")}
        >
          {t("drop.cancelAll")}
        </Button>
        <Button type="button" variant="outline" onClick={() => onAnswer(null)}>
          {t("drop.skip")}
        </Button>
        {clash && (
          <>
            <Button
              type="button"
              variant="outline"
              onClick={() => setName(freeName(request.taken[kind], trimmed))}
            >
              {t("drop.rename")}
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() => onAnswer({ kind, name: clash, replace: true })}
            >
              {t("drop.replace")}
            </Button>
          </>
        )}
        {!clash && (
          <Button type="submit" disabled={!ready}>
            {t("drop.add")}
          </Button>
        )}
      </div>
    </form>
  );
};

// Asks what a dropped SVG is: an icon or a logo, and its name. `request` is
// null when nothing is asked (see util/dropImages, `ask`).
const DropImageDialog = ({ request, onAnswer }) => (
  <Dialog open={!!request} onOpenChange={(open) => !open && onAnswer(null)}>
    {request && (
      <DialogContent aria-describedby={undefined}>
        <Form request={request} onAnswer={onAnswer} />
      </DialogContent>
    )}
  </Dialog>
);

export default DropImageDialog;
