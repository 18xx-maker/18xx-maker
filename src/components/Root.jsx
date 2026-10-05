import clsx from "clsx";
import { useEffect } from "react";
import { getI18n, useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { Outlet, useMatch, useNavigate } from "react-router";

import { compose } from "ramda";

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

import Alert from "@/components/Alert";
import Analytics from "@/components/Analytics";
import RenderState from "@/components/RenderState";
import ScrollToTop from "@/components/ScrollToTop";
import { ShortcutsDialog } from "@/components/Shortcuts";
import ExportHost from "@/components/export/ExportHost";
import AppSidebar from "@/components/nav/AppSidebar";
import Header from "@/components/nav/Header";
import SetSvgColors from "@/components/svg/SetSvgColors";

import { ThemeProvider } from "@/context/ThemeProvider";
import { useBindings, useConfig, useEditor } from "@/hooks";
import { detectedLanguage } from "@/locales/language";
import {
  createAlert,
  createDownloadPercent,
  createProgressAlert,
  createSetGame,
  createUpdate,
  loadGame,
} from "@/state";
import { selectLanguage } from "@/state/selectors";
import capability from "@/util/capability";
import { sniffConfigFile } from "@/util/config";
import { useBooleanParam } from "@/util/query";
import { getRenderInput } from "@/util/renderInput";
import * as idb from "@/util/storage/idb";
import * as opfs from "@/util/storage/opfs";

const Root = () => {
  const { t, i18n } = useTranslation();
  // Render mode has no chrome, only the page
  const render = !!getRenderInput();
  const [print] = useBooleanParam("print");
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const language = useSelector(selectLanguage);
  const { importConfig } = useConfig();

  // The language setting overrides the system one; without it follow the
  // system
  useEffect(() => {
    i18n.changeLanguage(language ?? detectedLanguage());
  }, [i18n, language]);

  const getEventFileHandle = (event) => {
    if (event.dataTransfer.items) {
      if (event.dataTransfer.items[0].kind === "file") {
        return event.dataTransfer.items[0].getAsFileSystemHandle();
      }
    }
  };
  const getEventFile = (event) => {
    if (event.dataTransfer.items) {
      if (event.dataTransfer.items[0].kind === "file") {
        return event.dataTransfer.items[0].getAsFile();
      }
    }

    return event.dataTransfer.files[0];
  };
  const dragOverHandler = (event) => {
    event.preventDefault();
  };
  // Everything read from the event happens before any await: a drop's items
  // are gone once the handler returns
  const captureDrop = (event) => {
    let file;
    try {
      file = getEventFile(event);
    } catch {
      // Not a file, handled below
    }

    const handle =
      !capability.electron && capability.system
        ? Promise.resolve(getEventFileHandle(event))
        : undefined;
    // A config drop never consumes the handle, do not leave a rejection
    // unhandled
    handle?.catch(() => undefined);

    return { file, handle };
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

  const dropHandler = (event) => {
    event.preventDefault();

    // Do nothing if this isn't a file drop
    if (
      !event.dataTransfer ||
      (event.dataTransfer.items && event.dataTransfer.items.length === 0) ||
      (event.dataTransfer.files && event.dataTransfer.files.length === 0)
    ) {
      return;
    }

    const dropped = captureDrop(event);

    // A config.json applies its settings, anything else is a game
    return sniffConfigFile(dropped.file)
      .then((imported) =>
        imported
          ? importConfig(imported)
          : fileHandler(dropped).then((slug) => navigate(`/games/${slug}/map`)),
      )
      .catch((e) =>
        dispatch(createAlert(t("alerts.error"), e.message, "error")),
      );
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
      const onGame = (game) => {
        dispatch(createSetGame(game));
        dispatch(
          createAlert(
            getI18n().t("alerts.gameLoaded"),
            getI18n().t("alerts.gameLoadedMessage", {
              title: game.info.title,
            }),
            "success",
          ),
        );
      };

      window.api.onAlert(compose(dispatch, createAlert));
      window.api.onGame(onGame);
      window.api.onProgress(compose(dispatch, createProgressAlert));
      window.api.onRedirect(navigate);
      window.api.onUpdate(compose(dispatch, createUpdate));
      window.api.onDownloadProgress(compose(dispatch, createDownloadPercent));

      return () => {
        window.api.off();
      };
    }
  }, [dispatch, navigate, render]);

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

  const [shortcuts, setShortcuts] = useBindings();
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
            <Outlet />
          ) : (
            <SidebarProvider>
              <AppSidebar />
              <SidebarInset className="w-full h-screen overflow-auto">
                <Header />
                <Outlet />
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
          {render ? (
            <RenderState />
          ) : (
            <>
              <Alert />
              <ExportHost />
              <ShortcutsDialog open={shortcuts} onOpenChange={setShortcuts} />
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
