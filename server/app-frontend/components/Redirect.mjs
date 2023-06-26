/**
 * *****************************************************************************
 *
 * Redirect
 *
 * 重定向组件,用于客户端页面导航.
 *
 * *****************************************************************************
 */

import React from './React.mjs';
import Context from "./Context.mjs";
import Countdown from './Countdown.mjs';

import { generatePath } from "../utils/generatePath.mjs";
import { createLocation } from '../utils/path/index.mjs';

export default class Redirect extends React.PureComponent {
  render () {
    const { match, to, push  } = this.props;

    const location = createLocation( 
      match 
        ? typeof to === "string"
          ? generatePath(to, match.params)
          : { ...to, pathname: generatePath(to.pathname, match.params)}
        : to
    );

    const message = `您访问的页面${location.pathname}不存在，页面将重定向到: ${location.pathname}`;
    const countdown = React.createElement(Countdown, {
      count: 5,
      callback: () => this.context.store.dispatch({ type: 'HISTORY_PUSH_STATE', payload: location }),
    });

    return React.createElement('div', null, message, countdown);
  }
}

Redirect.contextType = Context;
