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

import { Provider } from './components/Provider.mjs';
import { React } from './components/React.mjs';
import { Redirect } from './components/Redirect.mjs';
import { Route } from './components/Route.mjs';
import { Switcher } from './components/Switcher.mjs';

import { store } from './redux/store.mjs';
import * as Pages from './pages/index.mjs';

export default function (state) {
  const appState = store(state);

  const routes = store.getState('routes')
    .map(item => Object.assign({}, item, { app: Pages[item.app] }))
    .map(route => React.createElement(Route, { 
      path: route.path, 
      component: route.app, 
    }));

  return React.createElement(Provider, { 
    store: appState,
    children: React.createElement(Switcher, null, ...routes),
  }); 
}
