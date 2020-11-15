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
import Switcher from './components/Switcher.mjs';
import Redirect from './components/Redirect.mjs';
import Route from './components/Route.mjs';

export default function ReactApp (store) {
  const data = store.getState();

  const routes = [];

  let i = 0;

  for (const v of data.routes) {
    const component = await import(`./containers/${v.app}.mjs`).then(m => m.default);

    if (route.from) {
      routes.push(React.createElement(Redirect, { key: i++, ...route, component }));
    } else {
      routes.push(React.createElement(Route, { key: i++, ...route, component }));
    }
  }

  return React.createElement(Provider, { store }, React.createElement(Switcher, null, routes));
}
