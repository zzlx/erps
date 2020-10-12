/**
 * *****************************************************************************
 *
 * Redirect
 *
 * 重定向组件,用于客户端页面导航.
 *
 * *****************************************************************************
 */

import ReactContext from "./Context.mjs";
import { types } from '../actions/index.mjs';
import React from './React.mjs';


import assert from '../utils/assert.mjs';
import generatePath from "../utils/generatePath.mjs";
import path from '../utils/path.mjs';
import warning from '../utils/warning.mjs';

export default class Redirect extends React.PureComponent {
  render () {
    const Context = this.props.context || ReactContext; 
    return React.createElement(Context.Consumer, null, (context) => {
      const { match, to, push  } = this.props;
      const { store } = context;

      const location = path.createLocation(
        match 
          ? typeof to === "string"
            ? generatePath(to, match.params)
            : { ...to, pathname: generatePath(to.pathname, match.params)}
          : to
      );

      this.timer = setTimeout(() => {
        store.dispatch({
          type: types.HISTORY_PUSHSTATE,
          payload: location
        });
      }, 500);

      const message = `您访问的页面${window.location.pathname}不存在，页面重定向到: ${location.pathname}`;

      return React.createElement('p', null, message);
    });
  }

  componentWillUnmount() {
    clearTimeout(this.timer);
  }
}
