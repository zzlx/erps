/**
 * *****************************************************************************
 *
 * UI Operation System.
 *
 * Used for frontend user interface.
 *
 * *****************************************************************************
 */

import Provider from "./components/Provider.mjs";
import Switcher from "./components/Switcher.mjs";
import React from "./components/React.mjs";
import Route from "./components/Route.mjs";
import { createStore } from "./store/createStore.mjs"; 
import { routes } from "./routes.mjs";

/**
 * UI Application.
 *
 * Features:
 *
 * * frontend routes.
 * * lazy loade supportr
 * * ...
 *
 */

export default function App (props) {
  return React.createElement(Provider, { 
    store: createStore(props.data)
  }, React.createElement(
    Switcher,
    null,
    routes.map((r, i) => React.createElement(Route, { key: i, ...r })),
  ));
}
