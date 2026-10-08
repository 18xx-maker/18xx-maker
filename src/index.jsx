import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";

import { Router } from "@/router";
import AppRoutes from "@/routes";
import { store } from "@/state";
import capability from "@/util/capability";

import "@/locales/i18n";
import "@/styles/index.css";

// Test to see if we're running in electron or not. If so use the hash for the
// location since the pages are files
const App = () => (
  <StrictMode>
    <Provider store={store}>
      <Router hash={capability.electron}>
        <AppRoutes />
      </Router>
    </Provider>
  </StrictMode>
);

const container = document.getElementById("root");
const root = createRoot(container);
root.render(<App />);
