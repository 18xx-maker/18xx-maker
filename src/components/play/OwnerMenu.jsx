import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";

import {
  Archive,
  Copy,
  Link2,
  Lock,
  LockOpen,
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

import { useNavigate } from "@/router";
import { createAlert } from "@/state";

// What the owner of an online game can do: hand out the invite link, lock,
// unlock or archive it, or delete it. `onStatus` follows a status change.
const OwnerMenu = ({ api, gameId, status, inviteCode, onStatus }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [code, setCode] = useState(inviteCode);
  // The link shown for copying by hand: a new invite, or a refused clipboard
  const [shown, setShown] = useState(null);
  const [confirming, setConfirming] = useState(false);
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
  const fail = (error) =>
    dispatch(
      createAlert(t("play.board.owner.failed"), error?.message, "error"),
    );

  const copy = async (value) => {
    try {
      await navigator.clipboard.writeText(link(value));
      setShown(null);
    } catch {
      setShown(link(value));
    }
  };

  const renew = () =>
    once(async () => {
      try {
        const { inviteCode: next } = await api.newInvite(gameId);
        setCode(next);
        setShown(link(next));
        await copy(next).catch(() => {});
        setShown(link(next));
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
          aria-label={t("play.board.owner.link")}
          value={shown}
          className="h-8 w-72"
          onFocus={(event) => event.target.select()}
        />
      )}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
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
