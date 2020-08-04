/**
 * *****************************************************************************
 *
 *
 *
 *
 * *****************************************************************************
 */

import Clock from '../components/Clock.mjs';
import Redirect from '../components/Redirect.mjs';

export default function NotFound (props) {
  document.title = 'Error:404';
  const clock = React.createElement(Clock);
  const redirect = React.createElement(Redirect, {to: '/home'});
  return React.createElement('div', null, clock, redirect);
}
