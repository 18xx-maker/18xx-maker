import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { createApi } from "@/play/client/api";
import { createSession } from "@/play/client/socket";
import { undoTarget } from "@/play/history";
import { reduce } from "@/play/reduce";

const EMPTY = { status: "connecting", log: [], seats: [], presence: [] };

// The status of a game that failed to load: 401 sign in again, 403 and 410
// locked or archived, anything else (also no response) an error
const failure = (error) => ({
  status: error?.status === 401 ? "denied" : "error",
  error: error?.message || "error",
  locked: error?.status === 403 || error?.status === 410,
  missing: error?.status === 404,
});

// One online game: loads it once over REST and follows its event log over the
// websocket session. With `watch` (a spectator link) it needs no token: it
// loads the game by the code, never sends and is always locked. `deps` (tests
// only) replaces the api and the session.
export const usePlayGame = (
  { baseUrl, token, gameId, userId, watch },
  deps = {},
) => {
  const spectator = watch !== undefined;
  const [loaded, setLoaded] = useState(null);
  const [failed, setFailed] = useState(null);
  const [snapshot, setSnapshot] = useState(EMPTY);
  const [epoch, setEpoch] = useState(0);
  const session = useRef(null);
  const depsRef = useRef(deps);
  depsRef.current = deps;

  // The game loads once over REST
  useEffect(() => {
    let live = true;
    setLoaded(null);
    setFailed(null);
    setSnapshot(EMPTY);

    const { api = createApi({ baseUrl, token }) } = depsRef.current;
    (watch !== undefined ? api.watchGame(watch) : api.getGame(gameId))
      .then((game) => live && setLoaded(game))
      .catch((error) => {
        if (live) setFailed(failure(error));
      });

    return () => {
      live = false;
    };
  }, [baseUrl, token, gameId, userId, watch]);

  // The session follows it. A session that saw the lock stays locked for good,
  // so unlocking (a new epoch) opens a fresh one.
  const open = loaded !== null;
  useEffect(() => {
    if (!open) return;
    const create = depsRef.current.createSession || createSession;
    const current = create(
      watch !== undefined
        ? { baseUrl, watch }
        : { baseUrl, token, gameId, userId },
    );
    session.current = current;
    const unsubscribe = current.subscribe((view) => setSnapshot(view));
    return () => {
      session.current = null;
      unsubscribe();
      current.close();
    };
  }, [open, epoch, baseUrl, token, gameId, userId, watch]);

  const state = useMemo(() => reduce(snapshot.log), [snapshot.log]);
  const locked =
    spectator ||
    snapshot.status === "locked" ||
    (failed?.locked ?? false) ||
    loaded?.status === "locked" ||
    loaded?.status === "archived";

  const send = useCallback(
    (event) => {
      if (locked) return;
      session.current?.send(event);
    },
    [locked],
  );

  const undo = useCallback(() => {
    const target = undoTarget(snapshot.log);
    if (target === null) return;
    send({ type: "undo", target });
  }, [snapshot.log, send]);

  const seats = snapshot.seats.length ? snapshot.seats : loaded?.seats || [];
  const me = seats.find((seat) => seat.userId === userId) || null;

  let status = snapshot.status;
  if (failed) status = failed.status;
  else if (!loaded) status = "loading";

  return {
    status,
    game: loaded?.game || null,
    config: loaded?.config || null,
    seats,
    log: snapshot.log,
    state,
    presence: snapshot.presence,
    me,
    locked,
    spectator,
    missing: failed?.missing ?? false,
    gameId: loaded?.id ?? gameId,
    gameStatus: loaded?.status ?? null,
    ownerId: loaded?.ownerId ?? null,
    webhookSet: loaded?.webhookSet ?? false,
    // The owner set or removed the webhook: follow it without a refetch
    setWebhookSet: (value) =>
      setLoaded((game) => game && { ...game, webhookSet: value }),
    inviteCode: loaded?.inviteCode ?? null,
    watchCode: loaded?.watchCode ?? null,
    // The owner made or stopped the spectator link: follow it without a refetch
    setWatchCode: (value) =>
      setLoaded((game) => game && { ...game, watchCode: value }),
    // The owner changed the status of the game: follow it without a refetch
    setStatus: (value) => {
      setLoaded((game) => game && { ...game, status: value });
      if (value === "active") setEpoch((n) => n + 1);
    },
    send,
    undo,
    error: failed?.error || snapshot.error || null,
    // The error of a rejected move was seen
    dismissError: () => session.current?.clearError(),
  };
};

export default usePlayGame;
