import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { createBrowserRouter, createHashRouter } from "react-router";
import { RouterProvider } from "react-router/dom";

import { rootRoutes } from "@/routes";
import { store } from "@/state";
import capability from "@/util/capability";

import "@/locales/i18n";
import "@/styles/index.css";

// Test to see if we're running in electron or not. If so use a hash router
// since it's based on files
const createRouter = capability.electron
  ? createHashRouter
  : createBrowserRouter;
const router = createRouter(rootRoutes);

const App = () => (
  <StrictMode>
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  </StrictMode>
);

const container = document.getElementById("root");
const root = createRoot(container);
root.render(<App />);
