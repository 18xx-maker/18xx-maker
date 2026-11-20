import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";

import {
  Archive,
  Bell,
  Copy,
  Eye,
  EyeOff,
  Link2,
  Lock,
  LockOpen,
  RefreshCw,
  RotateCcw,
  Settings,
  Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";

import WebhookDialog from "@/components/play/WebhookDialog";

import { useNavigate } from "@/router";
import { createAlert } from "@/state";

// What the owner of an online game can do: hand out the invite link and the
// spectator link, lock, unlock or archive it, or delete it. `onStatus`
// follows a status change, `onWatch` a new or stopped spectator link.
const OwnerMenu = ({
  api,
  gameId,
  status,
  inviteCode,
  onStatus,
  webhookSet = false,
  onWebhook = () => {},
  watchCode = null,
  onWatch = () => {},
}) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [code, setCode] = useState(inviteCode);
  const [watch, setWatch] = useState(watchCode);
  // The link shown for copying by hand: a new link, or a refused clipboard.
  // { label, value }, the label says which link it is.
  const [shown, setShown] = useState(null);
  const [confirming, setConfirming] = useState(false);
  const [hooking, setHooking] = useState(false);
  const [busy, setBusy] = useState(false);
  // One request at a time: a repeated click cannot fire an action twice
  const [pending, setPending] = useState(false);
  const running = useRef(false);

  const once = async (fn) => {
    if (running.current) return;
    running.current = true;
    setPending(true);
    try {
      await fn();
    } finally {
      running.current = false;
      setPending(false);
    }
  };

  const link = (value) =>
    `${window.location.origin}/play/join/${encodeURIComponent(value)}`;
  const watchLink = (value) =>
    `${window.location.origin}/play/watch/${encodeURIComponent(value)}`;
  const inviteShown = (value) => ({
    label: t("play.board.owner.link"),
    value: link(value),
  });
  const watchShown = (value) => ({
    label: t("play.board.owner.watch"),
    value: watchLink(value),
  });
  const fail = (error) =>
    dispatch(
      createAlert(t("play.board.owner.failed"), error?.message, "error"),
    );

  // Copies the link, or shows it when the clipboard refuses
  const copyShown = async (value) => {
    try {
      await navigator.clipboard.writeText(value.value);
      setShown(null);
    } catch {
      setShown(value);
    }
  };
  const copy = (value) => copyShown(inviteShown(value));

  const renew = () =>
    once(async () => {
      try {
        const { inviteCode: next } = await api.newInvite(gameId);
        setCode(next);
        setShown(inviteShown(next));
        await copy(next).catch(() => {});
        setShown(inviteShown(next));
      } catch (error) {
        fail(error);
      }
    });

  // A new spectator link (the old one stops working), copied and shown
  const newWatch = async () => {
    const { watchCode: next } = await api.newWatch(gameId);
    setWatch(next);
    onWatch(next);
    await copyShown(watchShown(next));
    setShown(watchShown(next));
  };

  // Copies the spectator link, made first when there is none
  const copyWatch = () =>
    once(async () => {
      try {
        if (watch) await copyShown(watchShown(watch));
        else await newWatch();
      } catch (error) {
        fail(error);
      }
    });

  const renewWatch = () =>
    once(async () => {
      try {
        await newWatch();
      } catch (error) {
        fail(error);
      }
    });

  const stopWatch = () =>
    once(async () => {
      try {
        await api.deleteWatch(gameId);
        setWatch(null);
        onWatch(null);
        setShown((value) => (value?.value === watchLink(watch) ? null : value));
        dispatch(
          createAlert(t("play.board.owner.watchStopped"), "", "success"),
        );
      } catch (error) {
        fail(error);
      }
    });

  const change = (value) =>
    once(async () => {
      try {
        await api.setStatus(gameId, value);
        onStatus(value);
      } catch (error) {
        fail(error);
      }
    });

  // Resolves true when the server took the change
  const saveWebhook = async (url) => {
    let done = false;
    await once(async () => {
      try {
        const result = await api.setWebhook(gameId, url);
        onWebhook(result?.webhookSet ?? url !== null);
        dispatch(
          createAlert(
            t(
              url === null
                ? "play.board.owner.webhookRemoved"
                : "play.board.owner.webhookSaved",
            ),
            "",
            "success",
          ),
        );
        done = true;
      } catch (error) {
        fail(error);
      }
    });
    return done;
  };

  const remove = async () => {
    setBusy(true);
    try {
      await api.deleteGame(gameId);
      setConfirming(false);
      navigate("/play");
    } catch (error) {
      setConfirming(false);
      fail(error);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      {shown && (
        <Input
          readOnly
          aria-label={shown.label}
          value={shown.value}
          className="h-10 w-40 sm:w-72 md:h-8"
          onFocus={(event) => event.target.select()}
        />
      )}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="h-10 w-10 md:h-8 md:w-auto"
            aria-label={t("play.board.owner.menu")}
          >
            <Settings aria-hidden="true" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={() => copy(code)}>
            <Copy aria-hidden="true" />
            {t("play.board.owner.copy")}
          </DropdownMenuItem>
          <DropdownMenuItem disabled={pending} onSelect={renew}>
            <Link2 aria-hidden="true" />
            {t("play.board.owner.newInvite")}
          </DropdownMenuItem>
          <DropdownMenuItem disabled={pending} onSelect={copyWatch}>
            <Eye aria-hidden="true" />
            {t("play.board.owner.watch")}
          </DropdownMenuItem>
          {watch && (
            <>
              <DropdownMenuItem disabled={pending} onSelect={renewWatch}>
                <RefreshCw aria-hidden="true" />
                {t("play.board.owner.watchNew")}
              </DropdownMenuItem>
              <DropdownMenuItem disabled={pending} onSelect={stopWatch}>
                <EyeOff aria-hidden="true" />
                {t("play.board.owner.watchStop")}
              </DropdownMenuItem>
            </>
          )}
          <DropdownMenuItem
            disabled={pending}
            onSelect={() => setHooking(true)}
          >
            <Bell aria-hidden="true" />
            {t("play.board.owner.webhook")}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {status === "active" && (
            <DropdownMenuItem
              disabled={pending}
              onSelect={() => change("locked")}
            >
              <Lock aria-hidden="true" />
              {t("play.board.owner.lock")}
            </DropdownMenuItem>
          )}
          {status === "locked" && (
            <DropdownMenuItem
              disabled={pending}
              onSelect={() => change("active")}
            >
              <LockOpen aria-hidden="true" />
              {t("play.board.owner.unlock")}
            </DropdownMenuItem>
          )}
          {status !== "archived" ? (
            <DropdownMenuItem
              disabled={pending}
              onSelect={() => change("archived")}
            >
              <Archive aria-hidden="true" />
              {t("play.board.owner.archive")}
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem
              disabled={pending}
              onSelect={() => change("active")}
            >
              <RotateCcw aria-hidden="true" />
              {t("play.board.owner.reopen")}
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onSelect={() => setConfirming(true)}>
            <Trash2 aria-hidden="true" />
            {t("play.board.owner.delete")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <WebhookDialog
        open={hooking}
        onOpenChange={setHooking}
        webhookSet={webhookSet}
        pending={pending}
        onSave={saveWebhook}
      />
      <Dialog open={confirming} onOpenChange={setConfirming}>
        <DialogContent className="max-w-md">
          <DialogTitle>{t("play.board.owner.delete")}</DialogTitle>
          <DialogDescription>
            {t("play.board.owner.deleteBody")}
          </DialogDescription>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setConfirming(false)}>
              {t("play.board.owner.cancel")}
            </Button>
            <Button variant="destructive" disabled={busy} onClick={remove}>
              {t("play.board.owner.delete")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default OwnerMenu;
