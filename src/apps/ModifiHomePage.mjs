import React from 'react';

import {
  Button,
  RootContext as Context,
  Card,
  Modal,
  Nav,
  Pagination,
  QRCode,
  Spinner,
} from '../components/index.mjs';

import { 
  types as ActionTypes,
  print as printPage,
} from '../store/actions/index.mjs';

/**
 * 主页面
 * 显示欢迎界面及常用信息
 * 
 */

export default class MDocuments extends React.PureComponent {
  render() {
    const _ = React.createElement;
    const spinner = _(Spinner);

    const bt_1 = _(Button, { 
      'data-toggle': 'modal',
      'data-target': '.modal',
      link: true,
    }, 'modal') 

    const bt_2 = _(Button, { }, 'test') 
    const bt_3 = _(Button, { }, 'test2') 
    const bt_group = _('div', { className: 'btn-group mr-2' }, bt_1, bt_2, bt_3);
    const bt_group2 = _('div', {
      className: 'btn-group btn-group-vertical  mr-2'
    }, bt_1, bt_2, bt_3);

    const bt_toolbar = _('div', { className: 'btn-toolbar' }, bt_group);

    const test = _('div', null, 'test');
    const modal = _(Modal, null, test, test, test, test, test, test,); 
    const bt_print = _(Button, {onClick: printPage}, 'test') 

    return _('div', {}, bt_1, modal, bt_print);
  }

  componentDidMount() {
    if (this.props.match.params.docFile) {
      document.title = this.props.match.params.docFile;
    }
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    document.title = this.props.match.params.docFile;
  }
}
