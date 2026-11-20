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
// websocket session. `deps` (tests only) replaces the api and the session.
export const usePlayGame = ({ baseUrl, token, gameId, userId }, deps = {}) => {
  const [loaded, setLoaded] = useState(null);
  const [failed, setFailed] = useState(null);
  const [snapshot, setSnapshot] = useState(EMPTY);
  const session = useRef(null);
  const depsRef = useRef(deps);
  depsRef.current = deps;

  useEffect(() => {
    let live = true;
    let close = () => {};
    setLoaded(null);
    setFailed(null);
    setSnapshot(EMPTY);

    const { api = createApi({ baseUrl, token }), createSession: open } =
      depsRef.current;
    const create = open || createSession;

    api
      .getGame(gameId)
      .then((game) => {
        if (!live) return;
        setLoaded(game);
        const current = create({ baseUrl, token, gameId, userId });
        session.current = current;
        const unsubscribe = current.subscribe((view) => {
          if (live) setSnapshot(view);
        });
        close = () => {
          unsubscribe();
          current.close();
        };
      })
      .catch((error) => {
        if (live) setFailed(failure(error));
      });

    return () => {
      live = false;
      session.current = null;
      close();
    };
  }, [baseUrl, token, gameId, userId]);

  const state = useMemo(() => reduce(snapshot.log), [snapshot.log]);
  const locked =
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
    missing: failed?.missing ?? false,
    send,
    undo,
    error: failed?.error || snapshot.error || null,
  };
};

export default usePlayGame;
