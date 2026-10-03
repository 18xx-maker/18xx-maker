import { useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useMatch, useNavigate } from "react-router";

import { find, propEq } from "ramda";

import { firstSection, gameNav } from "@/components/gameNav";

import { useLoadedGame } from "@/hooks/game";
import { createAlert, createSetExportMenuOpen, refreshGame } from "@/state";
import { selectGameForSlug } from "@/state/selectors";
import capability from "@/util/capability";
import * as idb from "@/util/idb";
import { isControlTarget } from "@/util/keys";
import { useBooleanParam } from "@/util/query";

// The one place that handles keys for the whole app. It listens on the
// document and runs for every page. Keys of the open export menu are handled
// by the menu itself, a Radix menu stops them before they get here. The
// sidebar toggle (ctrl/cmd + b, ui/sidebar) and the view reset ("v",
// SvgEditor) stay with the component that owns their state.
export const useBindings = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const loadedGame = useLoadedGame();
  const game = useSelector((state) =>
    selectGameForSlug(state, loadedGame?.slug),
  );
  const viewingGame = useMatch("/games/:slug/:section/*");
  const [print] = useBooleanParam("print");
  const [, toggleConfig] = useBooleanParam("config");

  const handleKeyDown = useCallback(
    (event) => {
      if (isControlTarget(event)) return;
      if (event.altKey || event.ctrlKey || event.metaKey) return;

      // Keys for the game edit page, which a Radix layer closing on escape
      // has already claimed with preventDefault
      if (viewingGame) {
        // The toolbar keys, which the print page of an export does not have
        if (!print) {
          const item = find(propEq(event.key, "key"), gameNav);

          if (event.key === "c") {
            toggleConfig();
            return;
          }

          if (item) {
            navigate(`/games/${viewingGame.params.slug}/${item.section}`);
            return;
          }
        }

        if (
          event.key === "e" ||
          (event.key === "Escape" && !event.defaultPrevented)
        ) {
          navigate(`/games/${viewingGame.params.slug}`);
          return;
        }
      } else if (loadedGame) {
        // The game state is only the loaded game when the slugs agree
        const first = game ? firstSection(game) : "map";
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
          if (!capability.electron) break;

          if (viewingGame) {
            // The b18 pages and the print page have no export button
            if (!print && viewingGame.params.section !== "b18") {
              dispatch(createSetExportMenuOpen(true));
            }
          } else if (loadedGame) {
            navigate(`/games/${loadedGame.slug}/map`);
            dispatch(createSetExportMenuOpen(true));
          }
          break;
        case "?":
          navigate("/docs");
          break;
      }
    },
    [game, loadedGame, viewingGame, print, toggleConfig, dispatch, navigate],
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);

    // Cleanup the event listener on unmount
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);
};
