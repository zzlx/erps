/**
 * *****************************************************************************
 *
 * HomePage
 *
 * *****************************************************************************
 */

import React from '../components/_React.mjs';
import Context from '../components/_Context.mjs';
import Circular from '../components/Circular.mjs';
import Nav from '../components/Nav.mjs';
import { Header, Footer } from '../components/Layout.mjs';
import Placeholder from '../components/Placeholder.mjs';
import PictureCollection from '../components/PictureCollection.mjs';
import TodoList from '../components/TodoList.mjs';
import Accordion from '../components/Accordion.mjs';
import Blockquote from '../components/Blockquote.mjs';

export default class HomePage extends React.Component {
  constructor(props, context) {
    super(props);

    this.state = { 
    };
  }

  render () {
    const store = this.context.store;
    const messages = store.getState({profiles: { messages: 1 } });

    const header = React.createElement(Header, { }, '函证中心');

    const circular = React.createElement(Circular, {
      size: "145"
    });
    const b = React.createElement(Blockquote, null, 
      React.createElement('p', null, 'text'),
      React.createElement('footer', null, 'text2'),
    );

    const footer = React.createElement(Footer, {
    }, 'Copyrigth(2020) All rights reserved.'); 

    const todoList = React.createElement(TodoList, {
      title: '待办列表',
    });

    const container = React.createElement('div', {
      className: 'container'
    }, todoList, b );

    return React.createElement(React.Fragment, {}, 
      header, 
      container,
      footer
    ); 
  }
}

HomePage.contextType = Context;
