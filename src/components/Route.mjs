/**
 * Route component
 *
 */

import React from 'react';
import PropTypes from 'prop-types';

import Context from './Context.mjs';
import matchPath from '../utils/matchPath.mjs';
import warning from '../utils/warning.mjs';

export default class Route extends React.PureComponent {
  render() {
    if (this.props.title) {
      window.document.title = this.props.title;
    }

    const location = this.props.location ? this.props.location : window.location;
    const match = this.props.match
      ? this.props.match
      : this.props.path
        ? matchPath(location.pathname, this.props)
        : false;

    if (!match) return null;

    const props = { location, match };

    let { children, component, render } = this.props;

    if (Array.isArray(children) && children.length === 0) children = null;

    if ('function' === typeof children) {
      if ('function' === typeof children.constructor) {
        children = React.createElement(children, props);
      } else {
        children = children(props);
      }

      if (children === undefined) {
        if (process.env.NODE_ENV === 'development') {
          const { path } = this.props;
          warning(false,
            "You returned `undefined` from the `children` function of " +
              `<Route${path ? ` path="${path}"` : ""}>, but you ` +
              "should have returned a React element or `null`"
          );
        }

        children = null;
      }
    }

    return children && React.Children.count(children) !== 0 ? children : null;
  }
}

Route.contextType = Context;
 
if (process.env.NODE_ENV === 'development') {
  Route.propTypes = {
    children: PropTypes.oneOfType([PropTypes.func, PropTypes.node]),
    component: PropTypes.any,
    exact: PropTypes.bool,
    location: PropTypes.object,
    path: PropTypes.oneOfType([
      PropTypes.object,
      PropTypes.string,
      PropTypes.arrayOf(PropTypes.string)
    ]),
    render: PropTypes.func,
    sensitive: PropTypes.bool,
    strict: PropTypes.bool
  };

  Route.prototype.componentDidMount = function() {
    const isEmptyChildren = (children) => React.Children.count(children) === 0;

    warning(
      !(
        this.props.children &&
        !isEmptyChildren(this.props.children) &&
        this.props.component
      ),
      "You should not use <Route component> and <Route children> in the same route; <Route component> will be ignored"
    );

    warning(
      !(
        this.props.children &&
        !isEmptyChildren(this.props.children) &&
        this.props.render
      ),
      "You should not use <Route render> and <Route children> in the same route; <Route render> will be ignored"
    );

    warning(
      !(this.props.component && this.props.render),
      "You should not use <Route component> and <Route render> in the same route; <Route render> will be ignored"
    );
  };

  Route.prototype.componentDidUpdate = function(prevProps) {
    warning(
      !(this.props.location && !prevProps.location),
      '<Route> elements should not change from uncontrolled to controlled (or vice versa). You initially used no "location" prop and then provided one on a subsequent render.'
    );

    warning(
      !(!this.props.location && prevProps.location),
      '<Route> elements should not change from controlled to uncontrolled (or vice versa). You provided a "location" prop initially but omitted it on a subsequent render.'
    );
  };
}
