import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useMatch, useNavigate } from "react-router";

import { find, propEq } from "ramda";

import { sections as configSections } from "@/components/config";
import { firstSection, gameNav } from "@/components/gameNav";
import { docsPages } from "@/components/nav";

import { useLoadedGame } from "@/hooks/game";
import { createAlert, createSetExportMenuOpen, refreshGame } from "@/state";
import { selectExportSheetOpen, selectGameForSlug } from "@/state/selectors";
import capability from "@/util/capability";
import * as idb from "@/util/idb";
import { isControlTarget } from "@/util/keys";
import { useBooleanParam } from "@/util/query";
import { getRenderInput } from "@/util/renderInput";

// The item before ("[") or after ("]") the current one, wrapping around. With
// no current item it starts at the first or last.
const cycle = (list, index, key) => {
  const step = key === "]" ? 1 : -1;
  if (index < 0) return list[step > 0 ? 0 : list.length - 1];
  return list[(index + step + list.length) % list.length];
};

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
  const exportSheetOpen = useSelector(selectExportSheetOpen);
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

      // [ and ] go to the previous and next docs page, as the links at the
      // bottom of a docs page do. They stop at the first and last page.
      if (event.key === "[" || event.key === "]") {
        const path = pathname.replace(/(?<=.)\/$/, "");
        const index = docsPages.findIndex(({ to }) => to === path);
        const step = event.key === "]" ? 1 : -1;

        if (index >= 0) {
          if (docsPages[index + step]) navigate(docsPages[index + step].to);
          return;
        }
      }

      // Keys for the game edit page
      if (viewingGame) {
        // [ and ] cycle the config sections while the panel is open, else the
        // sections of the game. The sections without data for the game are
        // skipped.
        if (!print && (event.key === "[" || event.key === "]")) {
          const params = new URLSearchParams(location.search);

          if (params.has("config")) {
            const current = decodeURIComponent(
              params.get("section") || "colors",
            );
            const next = cycle(
              configSections,
              configSections.findIndex(({ section }) => section === current),
              event.key,
            );
            if (next.section === "colors") params.delete("section");
            else params.set("section", encodeURIComponent(next.section));
            navigate({ search: params.toString() });
          } else {
            const items = game
              ? gameNav.filter((item) => !item.disabled?.(game))
              : gameNav;
            const next = cycle(
              items,
              items.findIndex(
                ({ section }) => section === viewingGame.params.section,
              ),
              event.key,
            );
            navigate({
              pathname: `/games/${viewingGame.params.slug}/${next.section}`,
              search: location.search,
            });
          }
          return;
        }

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
        case "p":
          if (!viewingGame) navigate("/elements/positioning");
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
          // The menu is ExportHost's, for the loaded game on every page
          if (
            capability.electron &&
            !getRenderInput() &&
            !print &&
            game &&
            !exportSheetOpen
          ) {
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
      exportSheetOpen,
      toggleConfig,
      dispatch,
      navigate,
    ],
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
