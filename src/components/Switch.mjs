/**
 * Switch 
 *
 * 交换机组件: 
 * 用于匹配路由,最快速的渲染匹配的子组件
 *
 *
 * 
 */

import React from "react";
import PropTypes from "prop-types";

import Context from './Context.mjs';
import matchPath from '../utils/matchPath.mjs';
import warning from '../utils/warning.mjs';

export default function switcher (props) {
  return React.createElement(Switch, props); 
}

class Switch extends React.Component {
  render() {
    const location = this.props.location 
      ? this.props.location 
      : { pathname: window.location.pathname };

    let element, match;

    for (let child of this.props.children) {
      if (match == null && React.isValidElement(child)) {
        const path = child.props.path || child.props.from;

        // 执行匹配任务
        match = matchPath(location.pathname, { ...child.props, path });
        if (match) { 
          element = child; // 匹配到子组件
          break; // 结束遍历流程 
        }
      }
    }

    // 未匹配到子组件,输出null
    if (match == null) return null;

    // 渲染匹配到的子组件
    return React.cloneElement(element, { location, match, });
  }
}

Switch.contextType = Context;

Switch.prototype.shouldComponentUpdate = function (nextProps, nextState) {
  return true;
}
  
if (process.env.NODE_ENV === 'development') {
  Switch.propTypes = {
    children: PropTypes.node,
    location: PropTypes.object,
  }

  Switch.prototype.componentDidUpdate = function(prevProps) {
    warning(
      !(this.props.location && !prevProps.location),
      '<Switch> elements should not change from uncontrolled to controlled (or vice versa). You initially used no "location" prop and then provided one on a subsequent render.'
    );

    warning(
      !(!this.props.location && prevProps.location),
      '<Switch> elements should not change from controlled to uncontrolled (or vice versa). You provided a "location" prop initially but omitted it on a subsequent render.'
    );
  }
}
