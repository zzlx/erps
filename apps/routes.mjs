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
// import lazy from "./components/lazy.mjs";
// import * as layout from "./components/layout/index.mjs";
import HomePage from "./pages/HomePage.mjs";
//import Test from "./pages/Test1.mjs";
import NotFound from "./pages/NotFound.mjs";

export const routes = [
  { path: "/", component: HomePage, exact: true },
  { path: ["/homepage", "/homepage/about"], component: HomePage, exact:true },
  { path: "*", component: NotFound },
];
