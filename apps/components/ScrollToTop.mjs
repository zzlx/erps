/**
 *
 * ScrollToTop 
 * 
 * 业务逻辑:
 * 1.检测父元素是否发生scroll,
 * 2.如果发生scroll则显示回到顶部按钮
 *
 */

import React from './React.mjs';
import Sprite from './Sprite.mjs';

export default class ScrollToTop extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = { show: false };
    this.Ref = React.createRef();
  }

  render() {
    const styles = { 
      position: 'fixed',
      bottom: '5rem', 
      right: '5rem',
      zIndex: 1000,
      opacity: 0.75,
    };

    return React.createElement(Sprite, {
      link: 'arrow-circle-top',
      fill: '#607080',
      refs: this.Ref,
      onClick: this.handleClick,
      className: `icon_32x32${this.state.show?' d-block':' d-none'}`,
      style: styles,
    });
  }

  componentDidMount() {
    this.Ref.current.parentElement.onscroll = () => {
      this.setState({show: true});
    }
  }

  handleClick(e) {
    e.preventDefault();
    e.target.parentElement.scrollTop = 0;
  }
}
