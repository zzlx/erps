/**
 * *****************************************************************************
 *
 * Spinner
 *
 * Indicate the loading state of a component or page 
 *
 * 使用方法：
 *
 *
 *
 * *****************************************************************************
 */

import React from './React.mjs';
export default class Spinner extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = { 
      dot: '.',
      display: true,
    };
  }

  render () {
    const e = React.createElement;
    const { border, sm, lg, grow, className, children, ...rests } = this.props;

    const cn = [];

    if (border ^ grow && grow) {
      cn.push('spinner-grow');
      if (lg ^ sm && lg) { cn.push('spinner-grow-lg'); }
      else cn.push('spinner-grow-sm');
    } else {
      cn.push('spinner-border');
      if (lg ^ sm && lg) { cn.push('spinner-border-lg'); }
      else cn.push('spinner-border-sm');
    }

    if (className) cn.push(className);

    const span = e('span', {
      className: cn.join(' ') || null,
      role: 'status',
      ...rests
    });

    if (!this.state.display) return null;

    return e('div', {
      className: 'd-print-none px-3',
    }, span, children || '加载中', this.state.dot);
  }

  componentDidMount() {
    this.timer = setInterval(() => {
      if (this.state.dot.length >= 6) this.setState({dot: ''});
      this.setState(state => ({dot: state.dot + '.'}));
    }, 1000);

    // 10秒种后设置隐藏状态
    /*
    this.timeout = setTimeout(() => {
      this.setState(state => ({display: false }));
    }, 10 * 1000);
    */

  }

  componentWillUnmount() {
    if (this.timer) clearInterval(this.timer);
    if (this.timeout) clearTimeout(this.timeout);
  }
}

