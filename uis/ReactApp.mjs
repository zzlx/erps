/**
 * *****************************************************************************
 *
 * Application
 *
 * @param {object} store
 * @return {object} element
 *
 * *****************************************************************************
 */

import Provider from './components/_Provider.mjs';
import React from './components/_React.mjs';
import Redirect from './components/_Redirect.mjs';
import Route from './components/_Route.mjs';
import Switcher from './components/_Switcher.mjs';
import * as Pages from './apps/index.mjs';
import Store from './redux/Store.mjs';

export default function (state) {
  const store = new Store(state);

  const routes = store.getState('routes')
    .map(item => Object.assign({}, item, { app: Pages[item.app] }))
    .map(route => React.createElement(Route, { 
      path: route.path, 
      component: route.app, 
    }));

  return React.createElement(Provider, { 
    store: store,
    children: React.createElement(Switcher, null, ...routes),
  }); 
}
