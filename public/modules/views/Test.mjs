/**
 * *****************************************************************************
 *
 * 测试页面
 *
 * @file Test.mjs
 * *****************************************************************************
 */

import React from 'react';

class Nav extends React.Component {
  constructor(props) {
    super(props);
  }

  render () {
    return React.createElement('h1', {
      onClick: this.handleClick,
    }, 'hello!');
  }

  handleClick (e) {
    console.log(e.target);
  }
}

export default React.createElement(Nav);
