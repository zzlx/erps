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
import matchPath from '../utils/matchPath.mjs';

export default function Switcher (props) {
  const { location, children } = props;
  let element, match;

  for (const child of children) {
    if (match == null && React.isValidElement(child)) {
      const path = child.props.path || child.props.from;
      match = matchPath(location.pathname, { ...child.props, path });
    }

    if (match) { element = child; break; }
  }

  if (match == null) return null;

  return React.cloneElement(element, { location, match });
}
