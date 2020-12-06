/**
 * *****************************************************************************
 * 
 * React Application
 *
 *
 * @param {object} state
 * @return {object} element
 *
 * *****************************************************************************
 */

import Provider from './components/Provider.mjs';
import React from './components/_React.mjs';
import Redirect from './components/Redirect.mjs';
import Route from './components/Route.mjs';
import Switcher from './components/Switcher.mjs';
import * as Pages from './containers/index.mjs';

export default function App (store) {
  let i = 0;

  const routes = [
    { path: '/', app: Pages.HomePage },
    { path: '/*', app: Pages.NotFound },
  ].map(route => React.createElement(Route, {
    key: i++,
    path: route.path,
    component: route.app,
  }));

  const router = React.createElement(Switcher, { 
    location: { pathname: '/' }, 
  }, routes);

  return React.createElement(Provider, { store }, router); 
}
