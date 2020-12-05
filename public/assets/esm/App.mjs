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

import HomePage from './containers/HomePage.mjs';
import NotFound from './containers/NotFound.mjs';

export default function App (store) {
  let i = 0;
  const routes = [
    React.createElement(Route, { path: '/', component: HomePage, key: i++ }),
    React.createElement(Route, { path: '*', component: NotFound, key: i++ }),
  ];

  const router = React.createElement(Switcher, { 
    location: { pathname: '/' }, 
  }, routes);

  return React.createElement(Provider, { store }, router); 
}
