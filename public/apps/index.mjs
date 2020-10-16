/**
 * *****************************************************************************
 *
 * UI Application 
 * ==============
 *
 * ## 功能描述
 * * Provider容器组件
 * * state管理器
 * * 客户端路由逻辑 
 * * 路由数据配置
 * * lazy加载路由模块
 * * suspense加载器
 *
 * ## Usage
 *
 * ```
 * const app = App();
 * ```
 *
 * @return {object} react element
 * @api public
 *
 * *****************************************************************************
 */

import Provider from '../components/Provider.mjs';
import Redirect from '../components/Redirect.mjs';
import Switch from '../components/Switch.mjs';
import Route from '../components/Route.mjs';
import Spinner from '../components/Spinner.mjs';

export default function App (store) {
  console.log(store.getState('routes'));
  const routes = store.getState('routes');
  const routeArray = [];
  let i = 0;

  for (let route of routes) {
    const component = React.lazy(() => import(`./${route.view}.mjs`));

    if (route.from) {
      routeArray.push(React.createElement(Redirect, { key: i++, ...route, component }));
    } else {
      routeArray.push(React.createElement(Route, { key: i++, ...route, component }));
    }
  }

  const switcher = React.createElement(Switch, null, routeArray);
  const suspense = React.createElement(React.Suspense, {
    fallback: React.createElement(Spinner, null, '加载中...'),
  }, switcher);

  return React.createElement(Provider, { store }, suspense);
}

export function getInitialState () {
}
