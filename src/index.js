import React from "react";
import { render } from "react-dom";
import "./fonts.css";
import "./index.css";
import { unregister } from "./registerServiceWorker";

import "./i18n";
import { BrowserRouter, HashRouter } from "react-router-dom";

import App from "./App";

// Test to see if we're running in electron or not. If so use a hash router
// since it's based on files
const Router = window.isElectron ? HashRouter : BrowserRouter;

render(
  <Router>
    <App />
  </Router>,
  document.getElementById("root")
);

unregister();
