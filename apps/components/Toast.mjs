/**
 * *****************************************************************************
 *
 * Toast组件
 *
 * a lightweight and easily customizable alert message.
 *
 * *****************************************************************************
 */

import React from './React.mjs';
import Button from './Button.mjs';

export default class Toast extends React.PureComponent {
  constructor(props) {
    super(props);
    this.Ref = React.createRef();
    this.closeHandler = this.closeHandler.bind(this);
  }

  closeHandler(e) {
    const toast = this.Ref.current;
    toast.classList.remove('show');
    this.timeout = setTimeout(() => {
      toast.parentNode.removeChild(toast);
    }, 500);
  }

  componentWillUnmount() {
    clearTimeout(this.timeout); 
  }

  render() {
    const { 
      header, 
      src, className, children, ...rests
    } = this.props;

    const cn = ['toast'];
    cn.push('fade');
    cn.push('show');
    if (className) cn.push(className);

    const e = React.createElement;
    return e('div', { 
      className: cn.join(' '), 
      ref: this.Ref,
      role: 'alert',
      'aria-live': "assertive",
      ...rests 
    }, 
      e('div', { className: 'toast-header' }, 
        src ? e('img', {className: 'rounded mr-2', src}) : null, 
        e('strong', { className: 'mr-auto' }, header || 'Title'), 
        e(Button.Close, {
          className: 'ml-2 mb-1', 
          'data-dismiss': 'toast', 
          onClick: this.closeHandler
        })
      ), 
      e('div', { className: 'toast-body', children })
    );
  }
}
