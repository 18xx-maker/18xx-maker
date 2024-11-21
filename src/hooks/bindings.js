import { useDispatch } from "react-redux";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import capability from "@/util/capability";
import * as idb from "@/util/idb";
import { refreshGame } from "@/state";
import { useLoadedGame } from "@/hooks/game";

export const useBindings = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const loadedGame = useLoadedGame();

  const handleKeyDown = (event) => {
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
          window.api.openGame().then((slug) => navigate(`/games/${slug}/map`));
        } else if (capability.system) {
          idb.openFilePicker().then((slug) => navigate(`/games/${slug}/map`));
        }
        break;
      case "r":
        dispatch(refreshGame());
        break;
      case "t":
        navigate("/elements/tiles");
        break;
      case "?":
        navigate("/docs");
        break;
    }
  };

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);

    // Cleanup the event listener on unmount
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);
};
