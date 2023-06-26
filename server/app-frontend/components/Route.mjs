/**
 * *****************************************************************************
 *
 * Route Component(路由组件)
 *
 * 通配符规则：
 *
 * * :paramName 匹配URL的一个部分，直到遇到下一个/、?、#为止。
 *   这个路径参数可以通过this.props.params.paramName取出。
 * * () 可选部分
 * * * 匹配任意字符，直到模式里面的下一个字符为止。匹配方式是非贪婪模式。
 * * ** 匹配任意字符，直到下一个/、?、#为止。匹配方式是贪婪模式
 *
 * *****************************************************************************
 */

import Context from './Context.mjs';
import React from './React.mjs';
import Suspense from './Suspense.mjs';

import { isPromise } from '../utils/is/isPromise.mjs';
import { matchPath } from '../utils/matchPath.mjs';

export default class Route extends React.Component {
  render() {
    // get location
    const location = this.props.location 
      ? this.props.location
      : this.context.store.getState('location');

    // 判断路由是否匹配
    const match = this.props.match
      ? this.props.match
      : this.props.path 
        ? matchPath(location.pathname, this.props)
        : false;

    if (!match) return null;

    const { children, component } = this.props;
    const props = { location, match };

    if (React.isValidElement(children)) return React.cloneElement(children, props);

    if (component) {
      if (React.isValidElement(component)) {
        return React.cloneEleemnt(component, props);
      }

      // class component
      if (typeof component.constructor === 'function') {
        return React.createElement(component, props);
      }

      if (typeof component === 'function') return component(props);
    }

    return null;
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (this.props == nextProps) return false;
    else return true;
  }

  componentDidMount () {
    const isEmptyChildren = (children) => React.Children.count(children) === 0;
  }

  componentDidUpdate (prevProps) {
  }
}

Route.contextType = Context;
