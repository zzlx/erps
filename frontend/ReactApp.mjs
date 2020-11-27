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

import React from './components/_React.mjs';
import Provider from './components/Provider.mjs';
import Switcher from './components/Switcher.mjs';
import Redirect from './components/Redirect.mjs';
import Route from './components/Route.mjs';
import UIStorage from './utils/UIStorage.mjs';

import HomePage from './containers/HomePage.mjs';


export default function App () {
  const store = new UIStorage();

  const routesArray = [];

  let i = 0;

  const doc = store.getState('profiles').findOne({name: 'routes'});
  const routes = doc ? doc.value : [];

  for (const route of routes) {
    const component = import(`./containers/${route.app}.mjs`).then(m => m.default);

    if (route.from) {
      routesArray.push(React.createElement(Redirect, { key: i++, ...route, component }));
    } else {
      routesArray.push(React.createElement(Route, { key: i++, ...route, component }));
    }
  }

  return React.createElement(Provider, { 
    store 
  }, React.createElement(Switcher, null, routesArray));
}
