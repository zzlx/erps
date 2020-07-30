/**
 * *****************************************************************************
 *
 * 首页面前端程序
 *
 * @file HomePage.mjs
 * *****************************************************************************
 */

import React from 'react';
import Placeholder from '../components/Placeholder.mjs';
import Context from '../components/Context.mjs';
import Container from '../components/Container.mjs';

export default class HomePage extends React.Component {
  static contextType = Context;

  constructor(props, context) {
    super(props);
    this.state = { };
    this.needQuery = false;
  }

  render () {
    const { store } = this.context;

    return React.createElement(Container, {
      fluid: true,
    }, Placehosder);
  }

}
