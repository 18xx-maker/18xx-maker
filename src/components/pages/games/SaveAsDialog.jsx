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
import { Label } from "@/components/ui/label";

import { NAME_EXISTS, sanitizeFilename } from "@/util/filename";

// Asks for the name of the copy of a game that is saved in the private file
// system (the other places have a dialog of their own). `onSave(name,
// overwrite)` resolves to the slug of the saved game; a name that is taken is
// offered as a replacement before anything is overwritten.
const SaveAsForm = ({ onOpenChange, defaultName, onSave }) => {
  const { t } = useTranslation();
  const [name, setName] = useState(defaultName);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const valid = sanitizeFilename(name, { urlSafe: true }) !== "";

  const submit = async (overwrite) => {
    setBusy(true);
    try {
      await onSave(name, overwrite);
    } catch (e) {
      setError(e.code);
    } finally {
      setBusy(false);
    }
  };

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        if (valid && !busy) submit(error === NAME_EXISTS);
      }}
    >
      <div className="flex flex-col gap-2">
        <Label htmlFor="save-as-name">{t("saveAs.filename")}</Label>
        <Input
          id="save-as-name"
          value={name}
          autoFocus
          onFocus={(event) => event.target.select()}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? "save-as-error" : undefined}
          onChange={(event) => {
            setName(event.target.value);
            setError(null);
          }}
        />
        {error && (
          <p id="save-as-error" role="alert" className="text-sm">
            {t(error === NAME_EXISTS ? "saveAs.exists" : "saveAs.invalid")}
          </p>
        )}
      </div>
      <div className="flex flex-row justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => onOpenChange(false)}
        >
          {t("saveAs.cancel")}
        </Button>
        <Button
          type="submit"
          disabled={!valid || busy}
          variant={error === NAME_EXISTS ? "destructive" : "default"}
          className={error === NAME_EXISTS ? undefined : "text-background"}
        >
          {t(error === NAME_EXISTS ? "saveAs.replace" : "saveAs.save")}
        </Button>
      </div>
    </form>
  );
};

const SaveAsDialog = ({ open, onOpenChange, defaultName, onSave }) => {
  const { t } = useTranslation();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogTitle>{t("saveAs.title")}</DialogTitle>
        <DialogDescription>{t("saveAs.description")}</DialogDescription>
        <SaveAsForm
          onOpenChange={onOpenChange}
          defaultName={defaultName}
          onSave={onSave}
        />
      </DialogContent>
    </Dialog>
  );
};

export default SaveAsDialog;
