/**
 * *****************************************************************************
 *
 * 客户端路由配置
 *
 * routes configurations
 *
 * *****************************************************************************
 */

import React from "./components/React.mjs";
import Switcher from "./components/Switcher.mjs";
import Route from "./components/Route.mjs";

// import lazy from "./components/lazy.mjs";
// import * as layout from "./components/layout/index.mjs";
import HomePage from "./pages/HomePage.mjs";
//import Test from "./pages/Test1.mjs";
import NoMatch from "./pages/NoMatch.mjs";

export const routes = React.createElement(Switcher, null, 
  // HomePage
  React.createElement(Route, { 
    path: [
      "/", 
      "/homepage", 
      // "/homepage/*",
    ], 
    exact: false, 
    component: HomePage, 
  }), 
  // NoMatch
  React.createElement(Route, { path: "*", component: NoMatch }),
);
