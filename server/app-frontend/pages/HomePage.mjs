/**
 * *****************************************************************************
 *
 * HomePage
 * ========
 *
 * *****************************************************************************
 */

import Alert from '../components/Alert.mjs';
import Context from '../components/Context.mjs';
import React from '../components/React.mjs';
import Nav from '../components/Nav.mjs';
import TabContent from '../components/TabContent.mjs';

import { debuglog } from '../utils/debuglog.mjs';
const debug = debuglog('debug:HomePage');

export default class HomePage extends React.Component {
  render (props) {
    const t = (props) => React.createElement('div', { 
      className: 'g-col-6 g-col-md-4',
      id: props.id
    }, props.text);
    const hr = React.createElement('hr', { 
      className: 'border border-primary border-3 opacity-75'
    });
    const o = React.createElement(Nav, {
      //tabs: true,
      //position: 'vertical',
      //pills: true,
      //fill: true,
      data: [
        { text: 'Home', href: '/#Home', active: true },
        { text: 'Admin', href: '/#admin' },
        { text: 'About', href: '/about' },
        { text: 'Test', href: '/#test', disabled: true },
      ]

    });
    const tabc = React.createElement(TabContent, null, 
      t({text: 'a', id: 'Home'}), 
      t({text: 'b', id: 'admin'}), 
      t({text: 'c', id: 'about'}), 
    );

    return React.createElement('div', {
    }, hr, o, tabc);
  }

  componentDidMount () {
    debug(`${location.pathname} 已就绪，开始使用吧!`);
  }
}

HomePage.contextType = Context;
