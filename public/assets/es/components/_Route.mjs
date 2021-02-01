/**
 * *****************************************************************************
 *
 * Route 
 *
 * @param {object} props
 * @param {object} props.match
 * @param {string|array|object} props.path
 * @return {object}
 * *****************************************************************************
 */

import React from './_React.mjs';
import Context from './_Context.mjs';
import matchPath from '../utils/matchPath.mjs';

export default class Route extends React.Component {
  render() {
    const location = this.props.location 
      ? this.props.location 
      : this.context.store.getState('location')
        ? this.context.store.getState('location')
        : { pathname: '/' }; 

    const match = this.props.match
      ? this.props.match
      : this.props.path 
        ? matchPath(location.pathname, this.props)
        : false;

    if (!match) return null;

    const props = { location, match };

    let { children, component } = this.props;

    if (React.isValidElement(children)) return React.cloneElement(children, props);

    if (component) {
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
