/**
 * *****************************************************************************
 * 
 * Suspense
 *
 * *****************************************************************************
 */

import { React } from './React.mjs';
import { assert } from '../utils/assert.mjs';

export class Suspense extends React.Component {
   render() {
    const { fallback, children } = this.props
    const { promise } = this.state

    return React.createElement(React.Fragment, {
    }, promise ? fallback : children);
  }

  componentDidCatch(err) {
    if (assert.isPromise(err)) {
      this.setState({ promise: err }, () => {
        err.then(() => this.setState({ promise: null }))
      })
    }
  }
}
