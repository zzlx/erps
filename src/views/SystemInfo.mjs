/**
 * 显示系统信息
 *
 *
 */

import React from 'react';

export default class SystemInfo extends React.PureComponent {
  render() {
    const el = React.createElement;

    const header = el('h1', null, '系统信息');
    const retval = el('div', {}, header); 
    return retval;
  }
  
  componentDidMount() {
  }
}
