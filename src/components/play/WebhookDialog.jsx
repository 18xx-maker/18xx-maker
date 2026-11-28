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

// The same shape the play server accepts
const PATTERN =
  /^https:\/\/(?:discord|discordapp)\.com\/api\/webhooks\/\d+\/[\w-]+$/;

// The Discord webhook of a game. The saved url is never shown back: the
// server only says that one is set. `onSave(url | null)` resolves true when
// the server took it.
const WebhookDialog = ({ open, onOpenChange, webhookSet, pending, onSave }) => {
  const { t } = useTranslation();
  const [url, setUrl] = useState("");
  const [invalid, setInvalid] = useState(false);

  const change = (value) => {
    if (!value) {
      setUrl("");
      setInvalid(false);
    }
    onOpenChange(value);
  };

  const save = async () => {
    const value = url.trim();
    if (!PATTERN.test(value)) return setInvalid(true);
    setInvalid(false);
    if (await onSave(value)) change(false);
  };

  const remove = async () => {
    if (await onSave(null)) change(false);
  };

  return (
    <Dialog open={open} onOpenChange={change}>
      <DialogContent className="max-w-md">
        <DialogTitle>{t("play.board.owner.webhookTitle")}</DialogTitle>
        <DialogDescription>
          {t("play.board.owner.webhookBody")}
        </DialogDescription>
        {webhookSet && (
          <p className="text-sm font-medium" role="status">
            {t("play.board.owner.webhookOn")}
          </p>
        )}
        <form
          className="grid gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            if (!pending) save();
          }}
        >
          <Label htmlFor="webhook-url">
            {t("play.board.owner.webhookLabel")}
          </Label>
          <Input
            id="webhook-url"
            type="password"
            autoComplete="off"
            spellCheck={false}
            value={url}
            aria-invalid={invalid || undefined}
            aria-describedby="webhook-hint"
            onChange={(event) => {
              setUrl(event.target.value);
              setInvalid(false);
            }}
          />
          <p
            id="webhook-hint"
            className={
              invalid
                ? "text-sm text-destructive"
                : "text-sm text-muted-foreground"
            }
          >
            {t("play.board.owner.webhookHint")}
          </p>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => change(false)}
            >
              {t("play.board.owner.cancel")}
            </Button>
            {webhookSet && (
              <Button
                type="button"
                variant="destructive"
                disabled={pending}
                onClick={remove}
              >
                {t("play.board.owner.webhookRemove")}
              </Button>
            )}
            <Button type="submit" disabled={pending}>
              {t("play.board.owner.webhookSave")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default WebhookDialog;
