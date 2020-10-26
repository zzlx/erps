/**
 * *****************************************************************************
 *
 * 程序主界面
 *
 *
 *
 * *****************************************************************************
 */

import Context from '../components/Context.mjs';
import Circular from '../components/Circular.mjs';
import Nav from '../components/Nav.mjs';
import Footer from '../components/Footer.mjs';
import Placeholder from '../components/Placeholder.mjs';
import PictureCollection from '../components/PictureCollection.mjs';
import TodoList from '../components/TodoList.mjs';

export default class HomePage extends React.Component {
  constructor(props, context) {
    super(props);
    this.state = { 
    };
  }

  render () {
    const store = this.context.store;
    const messages = store.getState({profiles: { messages: 1 } });

    const header = React.createElement('header', {
      className: 'mb-auto container-fluid'
    }, '函证中心');

    const circular = React.createElement(Circular, {
      size: "145"
    });

    const footer = React.createElement(Footer, {
      className: 'container-fluid bg-gradient-default text-white',
      fluid: true,
    }, 'Copyrigth(2020) All rights reserved.'); 

    const todoList = React.createElement(TodoList, {
      title: '待办列表',
    });

    const container = React.createElement('div', {
      className: 'container'
    }, todoList);

    return React.createElement(React.Fragment, {}, 
      header, 
      container,
      footer
    ); 
  }
}

HomePage.contextType = Context;
