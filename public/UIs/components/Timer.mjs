/**
 *
 *
 *
 */

import React from './_React.mjs';
export default class Timer extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = { seconds: 0 };
  }

  tick () {
    this.setState(state => ({
      seconds: state.seconds + 1
    }));
  }

  componentDidMount() {
    this.interval = setInterval(() => this.tick(), 1000);
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  render() {
    return React.createElement('div',null, this.state.seconds);
  }
}
