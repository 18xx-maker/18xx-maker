import React from "react";
import { render } from "react-dom";
import { Provider } from "react-redux";
import store from "./store";
import "./fonts.css";
import "./index.css";
import App from "./App";
import { unregister } from "./registerServiceWorker";

render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById("root")
);
unregister();
