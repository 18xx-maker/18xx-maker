import { createRoot } from "react-dom/client";

import "./fonts.css";
import "./index.css";

import "./i18n";
import { BrowserRouter, HashRouter } from "react-router-dom";

import App from "./App";
import { isElectron } from "./util";

// Test to see if we're running in electron or not. If so use a hash router
// since it's based on files
const Router = isElectron ? HashRouter : BrowserRouter;

const container = document.getElementById("root");
const root = createRoot(container);
root.render(
  <Router>
    <App />
  </Router>,
);
