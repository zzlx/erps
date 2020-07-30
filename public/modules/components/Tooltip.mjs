/**
 * Tooltip组件
 * 
 */

import React from 'react';
import PropTypes from 'prop-types';
import Popper from 'popper.js';

export default function tooltip (props) {
  return React.createElement(Tooltip, props);
}

class Tooltip extends React.PureComponent { constructor(props) {
    super(props);
    this.Ref = React.createRef();
  }


  handleMouseOut(event) {
    this.tooltip.parentNode.removeChild(this.tips);
  }

  // 
  handleMouseOver(event){
    this.tooltip = event.currentTarget;

    this.tips = document.createElement('div');
    this.tips.classList.add('tooltip', 'bs-tooltip-top', 'show');
    this.tips.role = 'tooltip';
    this.tips.innerHTML = `<div class="arrow"></div><div class="tooltip-inner">${this.props.tips}</div>`;
    
    //
    this.tooltip.parentNode.insertBefore(this.tips, this.tooltip);

    this.popper = new Popper(this.tooltip, this.tips, {
      placement: this.props.position || 'top',
      removeOnDestroy: true,
    });
    
  }
  
  render() {
    const { children } = this.props;
    
    if (!React.isValidElement(children)) return null;

    // 应用tooltip
    return React.cloneElement(children, {
      ref: this.Ref,
      'data-toggle': "tooltip",
      onMouseOver: this.handleMouseOver,
      onMouseLeave: this.handleMouseOut,
    });
  }
}

if (process.env.NODE_ENV === 'development') {
  Tooltip.propTypes = {
    tips: PropTypes.string,
    children: PropTypes.element,
    position: PropTypes.string,
  }
}
