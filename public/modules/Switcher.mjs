/**
 * *****************************************************************************
 *
 * 客户端路由交换机
 * 
 * 根据路由路径选择需要渲染的view
 *
 *
 *
 * *****************************************************************************
 */

import Redirect from './components/Redirect.mjs';
import Route from './components/Route.mjs';
import Switch from './components/Switch.mjs';

export default class Switcher extends React.PureComponent {
  render () {
    let routeArray = [];
    let i = 0;

    for (let route of this.props.routes) {
      routeArray.push(React.createElement(Route, { key: i++, ...route }));
    }

    return React.createElement(React.Suspense, {
      fallback: 'Loading...',
    }, React.createElement(Switch, null, routeArray));
  }
}
