import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { matchPath, useLocation, useMatch, useNavigate } from "react-router";

import { find, propEq } from "ramda";

import { firstSection, gameNav } from "@/components/gameNav";

import { useLoadedGame } from "@/hooks/game";
import {
  createAlert,
  createSetExportMenuOpen,
  createSetExportSheetOpen,
  refreshGame,
} from "@/state";
import { selectGameForSlug } from "@/state/selectors";
import capability from "@/util/capability";
import * as idb from "@/util/idb";
import { isControlTarget } from "@/util/keys";
import { useBooleanParam } from "@/util/query";

// Whether the toolbar, and so the export button, can show for a section
const hasExportButton = (section) =>
  section !== "b18" && !!find(propEq(section, "section"), gameNav);

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
  const location = useLocation();
  const [shortcuts, setShortcuts] = useState(false);
  const [print] = useBooleanParam("print");
  const [, toggleConfig] = useBooleanParam("config");
  const { pathname } = location;

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
        } else if (pathname !== "/") {
          navigate("/");
        }
        return;
      }

      // Keys for the game edit page
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

        if (event.key === "e") {
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
          if (!capability.electron) break;

          if (viewingGame) {
            // The b18 pages, unknown sections and the print page have no export button
            if (!print && hasExportButton(viewingGame.params.section)) {
              dispatch(createSetExportMenuOpen(true));
            }
          } else if (loadedGame) {
            navigate(`/games/${loadedGame.slug}/map`);
            dispatch(createSetExportMenuOpen(true));
          }
          break;
        case "?":
          setShortcuts(true);
          break;
      }
    },
    [
      game,
      loadedGame,
      viewingGame,
      shortcuts,
      location,
      pathname,
      print,
      toggleConfig,
      dispatch,
      navigate,
    ],
  );

  // The flags only live while an export button can show them. A load that
  // failed or an unknown section lands on a page without one, and the flags
  // would wait there to open the menu on the next game page. This runs when
  // the page changes, so the open flag set by "x" just before it navigates to
  // a game page is kept.
  useEffect(() => {
    const match = matchPath("/games/:slug/:section/*", pathname);
    if (!match || print || !hasExportButton(match.params.section)) {
      dispatch(createSetExportMenuOpen(false));
      dispatch(createSetExportSheetOpen(false));
    }
  }, [pathname, print, dispatch]);

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);

    // Cleanup the event listener on unmount
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  return [shortcuts, setShortcuts];
};
