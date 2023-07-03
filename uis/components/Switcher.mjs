/**
 * *****************************************************************************
 *
 * 路由组件
 *
 * Route switcher
 *
 * *****************************************************************************
 */

import React from './React.mjs';
import Context from './Context.mjs';
import { matchPath } from '../utils/matchPath.mjs';

export default class Router extends React.PureComponent {
  render () {
    const location = this.props.location 
      ? this.props.location 
      : this.context.store 
        ? this.context.store.getState('location')
        : { pathname: "/" };

    let match, matchedRoute;

    for (const route of this.props.children) {
      if (match == null && React.isValidElement(route)) {
        const path = route.props.path || route.props.from;
        const opts = Object.assign({}, route.props, { path });
        match = matchPath(location.pathname, opts);
        if (match) { 
          matchedRoute = route; 
          break; 
        }
      }
    }

    return match == null ? null : React.cloneElement(matchedRoute, {
      location, 
      match 
    });
  }
}

Router.contextType = Context;
