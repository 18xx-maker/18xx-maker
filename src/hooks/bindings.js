import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useMatch, useNavigate } from "react-router";

import { find, prop, propEq } from "ramda";

import { firstSection, gameNav } from "@/components/gameNav";

import { useLoadedGame } from "@/hooks/game";
import { createAlert, refreshGame } from "@/state";
import capability from "@/util/capability";
import * as idb from "@/util/idb";
import { isControlTarget } from "@/util/keys";

export const useBindings = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const loadedGame = useLoadedGame();
  const game = useSelector(prop("game"));
  const viewingGame = useMatch("/games/:slug/:section/*");
  const location = useLocation();
  const [shortcuts, setShortcuts] = useState(false);

  const handleKeyDown = useCallback(
    (event) => {
      if (isControlTarget(event)) return;
      if (event.altKey || event.ctrlKey || event.metaKey) return;

      // The shortcuts dialog closes itself on escape, other keys are for it
      if (shortcuts) {
        if (event.key === "?") setShortcuts(false);
        return;
      }

      // Escape steps back one level: config panel, edit page, game page,
      // home. A Radix layer closing on escape has already claimed the event
      // with preventDefault.
      if (event.key === "Escape") {
        if (event.defaultPrevented) return;

        const params = new URLSearchParams(location.search);
        if (viewingGame && params.has("config")) {
          params.delete("section");
          params.delete("config");
          navigate({ search: params.toString() });
        } else if (viewingGame) {
          navigate(`/games/${viewingGame.params.slug}`);
        } else if (location.pathname !== "/") {
          navigate("/");
        }
        return;
      }

      // Keys for the game edit page
      if (viewingGame) {
        if (event.key === "e") {
          navigate(`/games/${viewingGame.params.slug}`);
          return;
        }
      } else if (loadedGame) {
        // The game state is only the loaded game when the slugs agree
        const first =
          game?.meta.slug === loadedGame.slug ? firstSection(game) : "map";
        const section =
          event.key === "e"
            ? first
            : event.key === "m"
              ? "map"
              : find(propEq(event.key, "key"), gameNav)?.section;

        if (section) {
          navigate(`/games/${loadedGame.slug}/${section}`);
          return;
        }
      }

      switch (event.key) {
        case "a":
          if (!viewingGame) navigate("/elements");
          break;
        case "c":
          if (!viewingGame) navigate("/elements/logos");
          break;
        case "d":
          navigate("/docs");
          break;
        case "g":
          if (loadedGame) navigate(`/games/${loadedGame.slug}`);
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
              .then((slug) => slug && navigate(`/games/${slug}`))
              .catch((e) => dispatch(createAlert(e.name, e.message, "error")));
          } else if (capability.system) {
            idb
              .openFilePicker()
              .then((slug) => slug && navigate(`/games/${slug}`))
              .catch((e) => dispatch(createAlert(e.name, e.message, "error")));
          }
          break;
        case "r":
          dispatch(refreshGame());
          break;
        case "t":
          if (!viewingGame) navigate("/elements/tiles");
          break;
        case "u":
          if (capability.electron) {
            navigate("/app");
          }
          break;
        case "x":
          // The export button opens its own menu when a game is showing
          if (capability.electron && loadedGame && !viewingGame) {
            navigate(`/games/${loadedGame.slug}/map`, {
              state: { exportMenu: true },
            });
          }
          break;
        case "?":
          setShortcuts(true);
          break;
      }
    },
    [game, loadedGame, viewingGame, shortcuts, location, dispatch, navigate],
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);

    // Cleanup the event listener on unmount
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  return [shortcuts, setShortcuts];
};
