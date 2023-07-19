/**
 * *****************************************************************************
 * 
 * Suspense
 *
 * *****************************************************************************
 */

import React from './React.mjs';
import { isPromise } from '../utils/is/isPromise.mjs';

export default class Suspense extends React.Component {
  render() {
    const { fallback, children } = this.props
    const { promise } = this.state

    return React.createElement(React.Fragment, {}, promise ? fallback : children);
  }

  componentDidCatch(err) {
    if (isPromise(err)) {
      this.setState({ promise: err }, () => {
        err.then(() => this.setState({ promise: null }))
      })
    }
  }
}
