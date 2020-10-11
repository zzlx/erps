/**
 *
 * Header Component
 *
 * 特性丰富的Header组件
 *
 */

import React from './React.mjs';

export default class Header extends React.PureComponent {

  render() {
    const { className, ...rests } = this.props;

    const cn = [
      'header',
      'd-print-none',
      'bg-gradient-primary',
      className,
    ].filter(Boolean).join(' ');

    return React.createElement('header', { className: cn, ...rests });
  }

  componentDidMount() {
    document.body.addEventListener('resize', resize); // 注册事件处理器
  }

  componentWillUnmount() {
    document.body.removeEventListener('resize', resize); // 移除事件处理器
  }
}

function resize () {
  if (window.matchMedia('(max-width: 600px)').matches) {
    /* the viewport is 600 pixels wide or less */
    //para.textContent = 'This is a narrow screen; ' + window.innerWidth + "px wide.";
    document.body.style.backgroundColor = 'red';
  } else if(window.matchMedia('(min-width: 1400px)').matches) {
    /* the viewport is more than than 1400 pixels wide */
    //para.textContent = 'This is a REALLY wide screen; ' + window.innerWidth + "px wide.";
    document.body.style.backgroundColor = 'green';
  } else {
    /* the viewport is more than than 400 pixels wide */
    //para.textContent = 'This is a wide screen; ' + window.innerWidth + "px wide.";
    document.body.style.backgroundColor = 'blue';
  }
}
