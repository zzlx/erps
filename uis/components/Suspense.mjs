/**
 * *****************************************************************************
 *
 * Suspense
 *
 * 为异步加载的组件提供容器
 *
 * *****************************************************************************
 */

import React from './_React.mjs';
import Spinner from './Spinner.mjs';

export default class Suspense extends React.PureComponent {
  constructor(props) {
    super();
  }

  render () {
    const { fallback, children } = this.props;

    return React.createElement(React.Suspense, {
      fallback: React.createElement(Spinner, null, '加载中...'),
      ...props,
    });
  }
}
