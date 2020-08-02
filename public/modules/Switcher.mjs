/**
 * *****************************************************************************
 *
 * 客户端路由交换机
 *
 *
 *
 * *****************************************************************************
 */

import Redirect from './components/Redirect.mjs';
import Route from './components/Route.mjs';
import Switch from './components/Switch.mjs';

export default function (routes) {
  return React.createElement(Switch, null, routes.map((v, k) => {
    const { view, ...rests } = v;

    const ViewPromise = import(`./views/${view}.mjs`);
    const View = React.createElement(React.Suspense, {
      fallback: () => 'Loading...'
    }, React.lazy(() => ViewPromise));

    return React.createElement(v.from ? Redirect : Route, { 
      key: k,
      ...rests,
    }, View);
  }));
}
