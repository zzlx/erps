/**
 * 首页面前端程序
 *
 */

import React from 'react';
import Placeholder from '../components/Placeholder.mjs';
import Context from '../components/Context.mjs';
import Container from '../components/Container.mjs';

export default class HomePage extends React.Component {
  constructor(props, context) {
    super(props);
    this.state = { };
    this.needQuery = false;
  }
}

HomePage.contextType = Context;

HomePage.prototype.render = function () {
  const { store } = this.context;

	return (
    <Container>
    test
    </Container>
	);
}
