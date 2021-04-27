/**
 * *****************************************************************************
 *
 * HomePage
 *
 * *****************************************************************************
 */

import { React } from '../components/React.mjs';
import { Context } from '../components/Context.mjs';
import { Circular } from '../components/Circular.mjs';
import { Nav } from '../components/Nav.mjs';
import { Header, Footer } from '../components/Layout.mjs';
import { Placeholder } from '../components/Placeholder.mjs';
import { PictureCollection } from '../components/PictureCollection.mjs';
import { TodoList } from '../components/TodoList.mjs';
import { Accordion } from '../components/Accordion.mjs';
import { Blockquote } from '../components/Blockquote.mjs';

export class HomePage extends React.Component {
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
      React.createElement('p', null, '函证中心项目'),
      React.createElement('footer', null, '管理询证函收发记录'),
    );

    /*
    const barcode = React.createElement(Barcode, {
      data: 'Wxm18039105900',
    });
    */

    const footer = React.createElement(Footer, {
    }, 'Copyrigth(2020) All rights reserved.'); 

    const todoList = React.createElement(TodoList, {
      title: '待办列表',
    });

    const container = React.createElement('div', {
      className: 'container'
    }, b, todoList);

    return React.createElement(React.Fragment, {}, 
      header, 
      container,
      footer
    ); 
  }

  componentDidMount() {
    //this.context.store.dispatch(send('TTTTTTT'));
  }
}

HomePage.contextType = Context;
