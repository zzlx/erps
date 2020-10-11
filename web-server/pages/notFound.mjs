/**
 * *****************************************************************************
 *
 * NotFound
 *
 *
 *
 *
 * *****************************************************************************
 */

import Clock from '../components/ClockWidget.mjs';
import Redirect from '../components/Redirect.mjs';
import React from '../components/React.mjs';

export default function NotFound (props) {
  const clock = React.createElement(Clock);
  const redirect = React.createElement(Redirect, {to: '/home'});
  return React.createElement('div', {
    className: 'container-fluid'
  }, clock, redirect);
}
