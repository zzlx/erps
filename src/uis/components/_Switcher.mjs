/**
 * *****************************************************************************
 *
 * Switcher
 *
 * 路由交换组件: 用于匹配路由,渲染匹配的子组件
 *
 * @param {object} props
 *
 * *****************************************************************************
 */

import React from './_React.mjs';
import Context from './_Context.mjs';
import matchPath from '../utils/matchPath.mjs';

export default class Switcher extends React.PureComponent {
  render () {
    const location = this.props.location || this.context.store.getState('location');
    let element, match;

    // iterator children
    for (const child of this.props.children) {
      if (match == null && React.isValidElement(child)) {
        const path = child.props.path || child.props.from;
        match = matchPath(location.pathname, { ...child.props, path });
      }

      if (match) { element = child; break; }
    }

    if (match == null) return null; // 未匹配到路由
 
    return React.cloneElement(element, { location, match });
  }
}

Switcher.contextType = Context;
