/**
 *
 * withOnLine
 * 
 */

import React from './React.mjs';

export default function WithOnLine(Component) {

  return class extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        onLine: true
      };
    }

    updateOnlineStatus() {
      this.setState({
        onLine: window.navigator.onLine,
      });
    }

    render() {
      return React.createElement(Component, {
        onLine: this.state.onLine, 
        ...this.props,
      });
    }

    componentDidMount() {
      window.addEventListener('online',  this.updateOnlineStatus);
      window.addEventListener('offline', this.updateOnlineStatus);
    }
    
    componentWillUnmount() {
      window.removeEventListener('online',  this.updateOnlineStatus);
      window.removeEventListener('offline', this.updateOnlineStatus);
    }
  }
}
