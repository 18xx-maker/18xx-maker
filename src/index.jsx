import { createRoot } from "react-dom/client";

import "./fonts.css";
import "./index.css";

import "./i18n";
import {
  createBrowserRouter,
  createHashRouter,
  RouterProvider,
} from "react-router-dom";

import { rootRoutes } from "./routes";
import { isElectron } from "./util";

// Test to see if we're running in electron or not. If so use a hash router
// since it's based on files
const createRouter = isElectron ? createHashRouter : createBrowserRouter;
const router = createRouter(rootRoutes, {
  future: {
    v7_relativeSplatPath: true,
    v7_fetcherPersist: true,
    v7_normalizeFormMethod: true,
    v7_partialHydration: true,
    v7_skipActionStatusRevalidation: true,
    v7_skipActionErrorRevalidation: true,
  },
});

const App = () => (
  <RouterProvider
    router={router}
    future={{
      v7_startTransition: true,
    }}
  />
);

const container = document.getElementById("root");
const root = createRoot(container);
root.render(<App />);
