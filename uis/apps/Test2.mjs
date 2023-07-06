/**
 * *****************************************************************************
 *
 * HomePage Application
 * ====================
 *
 * 提供网站主页面显示功能
 *
 * *****************************************************************************
 */

import Alert from '../components/Alert.mjs';
import Accordion from '../components/Accordion.mjs';
import Context from '../components/Context.mjs';
import React from '../components/React.mjs';
import Navbar from '../components/Navbar.mjs';
import RawHtml from '../components/RawHtml.mjs';
import Figure from '../components/Figure.mjs';
import Select from '../components/forms/Select.mjs';
import Check from '../components/forms/Checkbox.mjs';
import Radio from '../components/forms/Radio.mjs';
import Range from '../components/forms/Range.mjs';

import { debuglog } from '../utils/debuglog.mjs';
const debug = debuglog('debug:HomePage');

export default class HomePage extends React.Component {
  render (props) {

//    return React.createElement(Navbar, { });

    return React.createElement('div', { className: 'grid' }, 
      React.createElement(Accordion, {
        className: 'g-col-6',
        flush: true,
        data: [
          { header: 'header1', body: `test`, show: true },
          { header: 'header2', body: React.createElement('h2', null, 'test') },
          { header: 'header3', body: 'bbb' },
          { header: 'header4', body: 'ccc' },
          { header: 'header5', body: 'ddd' },
        ] 
      }),
      React.createElement('div', { 
        className: 'g-col-6', style: { 'minWidth': '5rem' } 
      }, 
        React.createElement(Check, { className: 'g-col-4', label: 'test', checked: true }),
        React.createElement(Radio, { className: 'g-col-4', label: 'test1', }),
        React.createElement(Radio, { className: 'g-col-4', label: 'ttttttt', checked: true}),
        React.createElement(Range, { className: 'g-col-4', defaultValue: 10, min: "0", max: "100"}),
      ), 
      React.createElement(Select, { 
        className: 'g-col-6',
        size: 'lg',
        options: [{value: 1, text: 'one'}, 'w', 3]
      }), 
    );
  }
}

HomePage.contextType = Context;
