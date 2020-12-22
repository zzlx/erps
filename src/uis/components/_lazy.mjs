/**
 * *****************************************************************************
 * 
 * lazy load component
 *
 *
 * *****************************************************************************
 */

import React from './_React.mjs';

export default function lazy (fn) {
  return class LazyComponent extends React.PureComponent {
    render () {
      const { fallback, ...rests } = this.props;

      if (this.state.component) return React.createElement(component);

      if (React.isValidElement(fallback)) {
        return fallback;
      } else {
        return null;
      }
    }

    componentDidMount () {
      fn().then(m => {
        this.setState({ component: m.default });
      }).catch(err => {
      });
    }
  }
}
