import clsx from "clsx";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector, useStore } from "react-redux";

import { compose } from "ramda";

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

import Alert from "@/components/Alert";
import Analytics from "@/components/Analytics";
import DropImageDialog from "@/components/DropImageDialog";
import DropOverlay from "@/components/DropOverlay";
import LoadingOverlay from "@/components/LoadingOverlay";
import RenderState from "@/components/RenderState";
import ScrollToTop from "@/components/ScrollToTop";
import { ShortcutsDialog } from "@/components/Shortcuts";
import ValidateGame from "@/components/ValidateGame";
import ExportHost from "@/components/export/ExportHost";
import AppSidebar from "@/components/nav/AppSidebar";
import Header from "@/components/nav/Header";
import SetSvgColors from "@/components/svg/SetSvgColors";

import { ThemeProvider } from "@/context/ThemeProvider";
import { useBindings, useConfig, useEditor, useSaveGame } from "@/hooks";
import { detectedLanguage } from "@/locales/language";
import { useMatch, useNavigate } from "@/router";
import {
  createAlert,
  createClearLoadingGame,
  createDownloadPercent,
  createProgressAlert,
  createSetAssets,
  createSetLoadingGame,
  createUpdate,
  loadGame,
  receiveGame,
} from "@/state";
import {
  selectEditorKeys,
  selectExportSheetOpen,
  selectGameChanged,
  selectLanguage,
} from "@/state/selectors";
import { MAX_DROP_FILES } from "@/util/assetNames";
import { sanitizeAssets } from "@/util/assets";
import { canAddAssets } from "@/util/canSaveGame";
import capability from "@/util/capability";
import { sniffConfigFile } from "@/util/config";
import {
  addDroppedImages,
  captureFiles,
  isGameDrop,
  makeStore,
} from "@/util/dropImages";
import { ELECTRON } from "@/util/loading";
import { useBooleanParam } from "@/util/query";
import { addRecent } from "@/util/recent";
import { getRenderInput } from "@/util/renderInput";
import * as idb from "@/util/storage/idb";
import * as opfs from "@/util/storage/opfs";

const Root = ({ children }) => {
  const { t, i18n } = useTranslation();
  // Render mode has no chrome, only the page
  const render = !!getRenderInput();
  const [print] = useBooleanParam("print");
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const store = useStore();
  const language = useSelector(selectLanguage);
  const { importConfig } = useConfig();
  const saver = useSaveGame();
  const saveRef = useRef(saver.save);
  saveRef.current = saver.save;
  const menuSaveRef = useRef(() => undefined);
  const menuKeyRef = useRef(() => undefined);

  // The language setting overrides the system one; without it follow the
  // system
  useEffect(() => {
    const next = language ?? detectedLanguage();
    i18n.changeLanguage(next);
    // The labels of the native menu follow it
    if (capability.electron && !render) window.api.setLanguage(next);
  }, [i18n, language, render]);

  const dragOverHandler = (event) => {
    event.preventDefault();
  };
  // Everything read from the event happens before any await: a drop's items
  // are gone once the handler returns
  const captureDrop = (event) => {
    const files = captureFiles(event.dataTransfer);
    // The file system handle of a single dropped game
    let handle;
    if (files.length <= 1 && !capability.electron && capability.system) {
      try {
        handle = Promise.resolve(
          event.dataTransfer.items?.[0]?.kind === "file"
            ? event.dataTransfer.items[0].getAsFileSystemHandle()
            : undefined,
        );
        // A config drop never consumes the handle, do not leave a rejection
        // unhandled
        handle.catch(() => undefined);
      } catch {
        handle = undefined;
      }
    }

    return { files, file: files[0]?.file, handle };
  };
  const fileHandler = ({ file, handle }) => {
    if (handle) {
      // Anything that is not a file (dropped text, a link) has no handle
      return handle.then((h) =>
        h
          ? idb.saveGameHandle(h)
          : Promise.reject(new Error(t("alerts.dropNotFile"))),
      );
    }

    if (capability.electron) {
      return window.api.saveGamePath(file);
    }

    if (capability.internal) {
      return opfs.saveGameFile(file);
    }

    return Promise.reject(new Error(t("alerts.dropUnsupported")));
  };

  // SVGs are asked about one after another: icon or logo, and the name
  const [asking, setAsking] = useState(null);
  const askSvg = (request) =>
    new Promise((resolve) => setAsking({ request, resolve }));
  const answerSvg = (answer) => {
    asking.resolve(answer);
    setAsking(null);
  };
  const dropping = useRef(false);
  const loadingId = useRef(0);
  // The loading card gives way to the drop overlay
  const [dropOver, setDropOver] = useState(false);

  const alertError = (message) =>
    dispatch(createAlert(t("alerts.error"), message, "error"));

  // Images dropped onto the game on screen become its custom images
  const imagesHandler = async ({ files }) => {
    const state = store.getState();
    const { loadedGame, game } = state;
    if (!loadedGame) return alertError(t("drop.noGame"));
    if (loadedGame.type === "bundled") return alertError(t("drop.bundled"));
    if (!canAddAssets(loadedGame.type)) {
      return alertError(t("alerts.dropUnsupported"));
    }
    // The game of the last session is not on screen (yet)
    if (game?.meta.slug !== loadedGame.slug) {
      return alertError(t("assets.errors.notfound"));
    }

    dropping.current = true;
    try {
      const result = await addDroppedImages({
        files,
        assets: state.assets?.[game.meta.slug],
        ask: askSvg,
        store: makeStore(game.meta, dispatch),
        t,
        max: MAX_DROP_FILES,
      });
      if (result) {
        dispatch(createAlert(result.title, result.message, result.type));
      }
    } catch (e) {
      alertError(e.message);
    } finally {
      dropping.current = false;
    }
  };

  const dropHandler = (event) => {
    event.preventDefault();

    // Do nothing if this isn't a file drop, in render mode, while a dialog is
    // open or another drop is still being added
    if (
      render ||
      document.querySelector('[role="dialog"]') ||
      dropping.current ||
      !event.dataTransfer ||
      (event.dataTransfer.items && event.dataTransfer.items.length === 0) ||
      (event.dataTransfer.files && event.dataTransfer.files.length === 0)
    ) {
      return;
    }

    const dropped = captureDrop(event);

    if (!isGameDrop(dropped.files)) {
      return imagesHandler(dropped);
    }

    // A config.json applies its settings, anything else is a game
    return sniffConfigFile(dropped.file)
      .then((imported) =>
        imported ? importConfig(imported) : openDroppedGame(dropped),
      )
      .catch((e) => alertError(e.message));
  };

  // Stores and reads the dropped game, with a loading state meanwhile. Only a
  // game that is really a file gets one; its errors go to the caller.
  const openDroppedGame = async (dropped) => {
    if (!dropped.file) {
      return fileHandler(dropped).then((slug) =>
        navigate(`/games/${slug}/map`),
      );
    }

    loadingId.current += 1;
    const id = loadingId.current;
    dispatch(createSetLoadingGame(dropped.file.name, id));
    try {
      const slug = await fileHandler(dropped);
      // Loading reports its own errors
      let game;
      try {
        game = await dispatch(loadGame(slug));
      } catch {
        return;
      }
      addRecent(game);
      navigate(`/games/${slug}/map`);
    } finally {
      dispatch(createClearLoadingGame(id));
    }
  };

  const printCss = print
    ? `
body {
  overflow: hidden;
  background: transparent;
}
`
    : null;

  useEffect(() => {
    // A capture window of an export only has the game it shows
    if (capability.electron && !render) {
      const onGame = (game) => dispatch(receiveGame(game));

      window.api.onAlert(compose(dispatch, createAlert));
      window.api.onAssets((id, assets) =>
        dispatch(createSetAssets(`${ELECTRON}:${id}`, sanitizeAssets(assets))),
      );
      window.api.onGame(onGame);
      window.api.onProgress(compose(dispatch, createProgressAlert));
      window.api.onRedirect(navigate);
      window.api.onSave(() => menuSaveRef.current());
      window.api.onMenu((key) => menuKeyRef.current(key));
      window.api.onUpdate(compose(dispatch, createUpdate));
      window.api.onDownloadProgress(compose(dispatch, createDownloadPercent));

      return () => {
        window.api.off();
      };
    }
  }, [dispatch, navigate, render]);

  // Unsaved edits are lost on a reload, so the browser asks first
  const changed = useSelector(selectGameChanged);
  useEffect(() => {
    if (!changed) return;
    const warn = (event) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [changed]);

  // The game of the last session is loaded on start, so what needs the game
  // (the export menu) works before a game page is opened. A game page loads
  // its own game.
  const loadedSlug = useSelector((state) => state.loadedGame?.slug);
  const onGamePage = !!useMatch("/games/:slug/*");
  const hasGame = useSelector((state) => !!state.game);
  useEffect(() => {
    if (!render && loadedSlug && !hasGame && !onGamePage) {
      dispatch(loadGame(loadedSlug, true)).catch(() => undefined);
    }
    // Once, on start
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cmd/Ctrl+S, and the File menu's Save, save the game of a game page. The
  // key always belongs to the app there, so the browser does not offer to save
  // the page; the save itself waits for the game to have changes, and for the
  // dialogs to be closed. It does not skip a key the JSON editor has used (its
  // Mod-s applies the text, and the save follows). In the Emacs and Vim modes
  // Ctrl+S in the editor is the mode's own, and the menu does not fire.
  const exportSheetOpen = useSelector(selectExportSheetOpen);
  const editorKeys = useSelector(selectEditorKeys);
  const maySave = () =>
    !render &&
    onGamePage &&
    !print &&
    !exportSheetOpen &&
    !document.querySelector('[role="dialog"]');
  const mayRef = useRef(maySave);
  mayRef.current = maySave;
  const onMenuSave = () => {
    if (mayRef.current()) saveRef.current();
  };
  menuSaveRef.current = onMenuSave;
  useEffect(() => {
    if (render || !onGamePage) return;
    const onKeyDown = (event) => {
      if (
        !(event.metaKey || event.ctrlKey) ||
        event.altKey ||
        event.shiftKey ||
        // The key itself, for layouts without a Latin s
        !(
          event.key.toLowerCase() === "s" ||
          (event.code === "KeyS" && !/^[a-z]$/i.test(event.key))
        )
      ) {
        return;
      }
      event.preventDefault();
      if (
        event.ctrlKey &&
        !event.metaKey &&
        editorKeys !== "normal" &&
        event.target instanceof Element &&
        event.target.closest(".cm-editor")
      ) {
        return;
      }
      if (event.repeat) return;
      mayRef.current() && saveRef.current();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [render, onGamePage, editorKeys]);

  const [shortcuts, setShortcuts, runKey] = useBindings();
  menuKeyRef.current = runKey;
  const inEditor = useEditor();

  return (
    <div
      id="dropzone"
      onDragOver={dragOverHandler}
      onDrop={dropHandler}
      className={clsx(capability.electron ? "electron" : "site")}
    >
      <ThemeProvider delayDuration={500}>
        <ScrollToTop>
          {inEditor || render ? (
            children
          ) : (
            <SidebarProvider>
              <AppSidebar />
              <SidebarInset className="w-full h-screen overflow-auto">
                <Header />
                {children}
              </SidebarInset>
            </SidebarProvider>
          )}
          <svg
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
            style={{ height: 0, width: 0, position: "absolute" }}
          >
            <defs>
              <marker
                id="arrow"
                viewBox="0 0 10 10"
                refX="8"
                refY="5"
                markerWidth="5"
                markerHeight="5"
                markerUnits="strokeWidth"
                orient="auto-start-reverse"
              >
                <path
                  d="M 0 0 L 8 4 L 8 6 L 0 10 z"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
              </marker>
              <clipPath id="hexClipPath">
                <polygon points="-86.0252,0 -43.0126,-74.5 43.0126,-74.5 86.0252,0 43.0126,74.5 -43.0126,74.5" />
              </clipPath>
              <clipPath id="hexBleedClipPath">
                <polygon points="-98.1495,0 -49.07475,-85 49.07475,-85 98.1495,0 49.07475,85 -49.07475,85" />
              </clipPath>
              <clipPath id="hexBleedClipPathDie">
                <polygon points="-98.1495,0 -54.84825,-75 54.84825,-75 98.1495,0 54.84825,75 -54.84825,75" />
              </clipPath>
              <clipPath id="hexBleedClipPathDieTop">
                <polygon points="-98.1495,0 -49.07475,-85 49.07475,-85 98.1495,0 54.84825,75 -54.84825,75" />
              </clipPath>
              <clipPath id="hexBleedClipPathDieBottom">
                <polygon points="-98.1495,0 -54.84825,-75 54.84825,-75 98.1495,0 49.07475,85 -49.07475,85" />
              </clipPath>
            </defs>
          </svg>
          <SetSvgColors />
          <ValidateGame />
          {render ? (
            <RenderState />
          ) : (
            <>
              <Alert />
              <LoadingOverlay hidden={dropOver} />
              <DropOverlay
                disabled={print || !!asking}
                onChange={setDropOver}
              />
              <DropImageDialog request={asking?.request} onAnswer={answerSvg} />
              <ExportHost />
              <ShortcutsDialog open={shortcuts} onOpenChange={setShortcuts} />
              {saver.dialog}
            </>
          )}
        </ScrollToTop>
        <style>{printCss}</style>
      </ThemeProvider>
      {!render && <Analytics />}
    </div>
  );
};

export default Root;
