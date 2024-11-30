import clsx from "clsx";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { Outlet, useNavigate } from "react-router";

import { compose } from "ramda";

import {
  ThemeProvider as MUIThemeProvider,
  StyledEngineProvider,
  createTheme,
} from "@mui/material/styles";

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

import Alert from "@/components/Alert";
import Analytics from "@/components/Analytics";
import ScrollToTop from "@/components/ScrollToTop";
import SetSvgColors from "@/components/SetSvgColors";
import AppSidebar from "@/components/nav/AppSidebar";
import Header from "@/components/nav/Header";

import { ThemeProvider } from "@/context/ThemeProvider";
import { useBindings } from "@/hooks";
import {
  createAlert,
  createDownloadPercent,
  createProgressAlert,
  createSetGame,
  createUpdate,
} from "@/state";
import capability from "@/util/capability";
import * as idb from "@/util/idb";
import * as opfs from "@/util/opfs";
import { useBooleanParam } from "@/util/query";

const theme = createTheme({});
const Root = () => {
  const [print] = useBooleanParam("print");
  const navigate = useNavigate();
  const dispatch = useDispatch();

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
  const fileHandler = (event) => {
    if (!capability.electron && capability.system) {
      return getEventFileHandle(event).then(idb.saveGameHandle);
    }

    const file = getEventFile(event);

    if (capability.electron) {
      return window.api.saveGamePath(file);
    }

    if (capability.internal) {
      return opfs.saveGameFile(file);
    }

    return Promise.reject(
      new Error("Your brower does not support dropping files"),
    );
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

    return fileHandler(event)
      .then((slug) => navigate(`/games/${slug}/map`))
      .catch((e) => dispatch(createAlert("Error", e.message, "error")));
  };

  const printCss = print
    ? `
body {
  overflow: hidden;
}
`
    : null;

  useEffect(() => {
    if (capability.electron) {
      const onGame = (game) => {
        dispatch(createSetGame(game));
        dispatch(
          createAlert("Game Loaded", `${game.info.title} loaded`, "success"),
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
  }, [dispatch, navigate]);

  useBindings();

  return (
    <div
      id="dropzone"
      onDragOver={dragOverHandler}
      onDrop={dropHandler}
      className={clsx(capability.electron ? "electron" : "site")}
    >
      <StyledEngineProvider injectFirst>
        <MUIThemeProvider theme={theme}>
          <ThemeProvider>
            <ScrollToTop>
              <SidebarProvider>
                <AppSidebar />
                <SidebarInset className="w-full h-screen overflow-auto">
                  <Header />
                  <Outlet />
                </SidebarInset>
              </SidebarProvider>
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
                  <clipPath id="hexBleedClipPathOffset">
                    <polygon points="-86.6025,0 -92.376,-9.999995337 -54.84825,-75 -43.30125,-75 -37.52775,-85 37.52775,-85 43.30125,-75 54.84825,-75 92.376,-9.999995337 86.6025,0 92.376,9.999995337 54.84825,75 43.30125,75 37.52775,85 -37.52775,85 -43.30125,75 -54.84825,75 -92.376,9.999995337" />
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
              <Alert />
            </ScrollToTop>
            <style>{printCss}</style>
          </ThemeProvider>
        </MUIThemeProvider>
      </StyledEngineProvider>
      <Analytics />
    </div>
  );
};

export default Root;
