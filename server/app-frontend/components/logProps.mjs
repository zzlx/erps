/**
 *
 *
 */

import React from './React.mjs';

export default function logProps(Component) {

  // Note the second param "ref" provided by React.forwardRef.
  // We can pass it along to LogProps as a regular prop, e.g. "forwardedRef"
  // And it can then be attached to the Component.
  return React.forwardRef((props, ref) => React.createElement(LogProps, { 
    forwardedRef: ref, 
    ...props, 
  }));
}

class LogProps extends React.Component {
  componentDidUpdate(prevProps) {
    console.log('old props:', prevProps);
    console.log('new props:', this.props);
  }

  render() {
    const {forwardedRef, ...rest} = this.props;
    return React.createElement(Component, {
      ref: forwardedRef,
      ...rest,
    });
  }
}
