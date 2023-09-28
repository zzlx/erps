/**
 * *****************************************************************************
 *
 * 时钟组件
 *
 * 目前仅可以显示本地时间, 实现服务器时间同步显示
 *
 * *****************************************************************************
 */

import React from './React.mjs';

export default class ClockWidget extends React.PureComponent {
  constructor(props) {
    super(props);

    const now = new Date();
    this.currentTimeZoneOffsetInHours = now.getTimezoneOffset() / 60;

    this.state = {
      // 时间戳
      // 返回自 1970-1-1 00:00:00  UTC（世界标准时间）至今所经过的毫秒数
      date: now.valueOf(),
    };
  }

  render() {
    const { 
      timestamp 
    } = this.props;

    if (null == this.state.date) {
      return null;
    } else {
      return new Date(this.state.date).toLocaleTimeString();
    }
  }

  componentDidMount() {
    this.timer = setInterval(
      () => this.setState(prevState => ({date: Date.now() })),
      1000
    );
  }

  componentWillUnmount() {
    clearInterval(this.timer);
  }
}
