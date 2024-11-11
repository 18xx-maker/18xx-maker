import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import {
  createBrowserRouter,
  createHashRouter,
  RouterProvider,
} from "react-router-dom";

import "./i18n";

import capability from "@/util/capability";
import { rootRoutes } from "./routes";
import { store } from "./state";

import "./fonts.css";
import "./index.css";

// Test to see if we're running in electron or not. If so use a hash router
// since it's based on files
const createRouter = capability.electron
  ? createHashRouter
  : createBrowserRouter;
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
  <Provider store={store}>
    <RouterProvider
      router={router}
      future={{
        v7_startTransition: true,
      }}
    />
  </Provider>
);

const container = document.getElementById("root");
const root = createRoot(container);
root.render(<App />);
