/**
 * *****************************************************************************
 *
 * UI Operation System.
 *
 * *****************************************************************************
 */

import Provider from "./components/Provider.mjs";
import Switcher from "./components/Switcher.mjs";
import React from "./components/React.mjs";
import Route from "./components/Route.mjs";
import { createStore } from "./store/createStore.mjs"; 
import { routes as r } from "./routes.mjs";

/**
 * UI Application.
 */

export default function App (props) {
  const store = createStore(props);
  const routes = r.map((r, i) => React.createElement(Route, { key: i, ...r }));
  const router = React.createElement(Switcher, null, routes);
  return React.createElement(Provider, { store: store }, router);
}
