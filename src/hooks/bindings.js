import { useCallback, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router";

import { useLoadedGame } from "@/hooks/game";
import { createAlert, refreshGame } from "@/state";
import capability from "@/util/capability";
import * as idb from "@/util/idb";

export const useBindings = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const loadedGame = useLoadedGame();

  const handleKeyDown = useCallback(
    (event) => {
      const tag = event.target.tagName;
      if (tag === "TEXTAREA" || tag === "INPUT") return;
      if (event.altKey || event.ctrlKey || event.metaKey) return;

      switch (event.key) {
        case "c":
          navigate("/elements/logos");
          break;
        case "e":
          navigate("/elements");
          break;
        case "g":
          if (loadedGame) navigate(`/games/${loadedGame.slug}/map`);
          break;
        case "h":
          navigate("/");
          break;
        case "l":
          navigate("/games/");
          break;
        case "o":
          if (capability.electron) {
            window.api
              .openGame()
              .then((slug) => slug && navigate(`/games/${slug}/map`))
              .catch((e) => dispatch(createAlert(e.name, e.message, "error")));
          } else if (capability.system) {
            idb
              .openFilePicker()
              .then((slug) => slug && navigate(`/games/${slug}/map`))
              .catch((e) => dispatch(createAlert(e.name, e.message, "error")));
          }
          break;
        case "r":
          dispatch(refreshGame());
          break;
        case "t":
          navigate("/elements/tiles");
          break;
        case "u":
          if (capability.electron) {
            navigate("/app");
          }
          break;
        case "?":
          navigate("/docs");
          break;
      }
    },
    [loadedGame, dispatch, navigate],
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);

    // Cleanup the event listener on unmount
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);
};
