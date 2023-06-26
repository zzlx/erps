/**
 *
 * Progress 
 *
 *
 * @props striped bool 是否显示条纹样式
 *
 */

import React from './React.mjs';

export default class ProgressBar extends React.PureComponent {
  render() {
    const { 
      min, now, max, label,striped, animated
    } = this.props;

    return React.createElement('div', { className: 'progress' }, 
      React.createElment('div', {
        className: `progress-bar${striped && ' progress-bar-striped'}${animated && ' progress-bar-animated'}`,
        role: 'progressbar',
        style: {width: `${now}%`},
        ariaValuenow: now,
        ariaValuemin: min,
        ariaValuemax: max,
        children: label ? now : ''
      })
    );
  }
}
