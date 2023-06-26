/**
 * *****************************************************************************
 * 
 * 倒计时组件
 *
 * *****************************************************************************
 */

import React from './React.mjs';

export default class Countdown extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = { seconds: Number.parseInt(props.count || 10) };
  }

  tick () {
    if (this.state.seconds === 0) {
      clearInterval(this.interval);
      const cb = this.props.callback;
      cb();
    } else {
      this.setState(state => ({ seconds: state.seconds - 1 }));
    }
  }

  componentDidMount() {
    this.interval = setInterval(() => this.tick(), 1000);
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  render() {
    const { callback, count, children, ...rests } = this.props;
    if (this.state.seconds === 0) return null;
    return React.createElement('span', { ...rests, }, children, this.state.seconds);
  }
}
