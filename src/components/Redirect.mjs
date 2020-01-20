/**
 * 重定向组件,用于客户端页面导航.
 *
 */

import React from "react";
import PropTypes from "prop-types";
import ReactContext from "./RootContext.mjs";
import { types } from '../store/actions/index.mjs';

import warning from '../utils/warning.mjs';
import path from '../utils/path.mjs';
import locationsAreEqual from '../utils/locationsAreEqual.mjs';
import generatePath from "../utils/generatePath.mjs";

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

if (process.env.NODE_ENV === 'development') {
  Redirect.propTypes = {
    from: PropTypes.string,
    to: PropTypes.oneOfType([PropTypes.string, PropTypes.object]).isRequired,
    push: PropTypes.bool,
  };
}
