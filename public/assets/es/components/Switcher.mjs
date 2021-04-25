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

import { React } from './React.mjs';
import { Context } from './Context.mjs';
import { matchPath } from '../utils/matchPath.mjs';

export class Switcher extends React.PureComponent {
  render () {
    const location = this.props.location || this.context.store.getState('location');
    let element, match;

    for (const child of this.props.children) {

      if (match == null && React.isValidElement(child)) {
        const path = child.props.path || child.props.from;
        const opts = Object.assign({}, child.props, { path });
        match = matchPath(location.pathname, opts);
      }

      if (match) { 
        element = child; 
        break; 
      }
    }

    if (match == null) return null; // 未匹配到路由
 
    return React.cloneElement(element, { location, match });
  }
}

Switcher.contextType = Context;
