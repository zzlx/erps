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

import Redirect from '../components/Redirect.mjs';

export default function NotFound (props) {
  const redirect = React.createElement(Redirect, { to: '/' });
  const backHome = React.createElement('a', { href: '/', className: 'button' }, '返回首页');

  return React.createElement('div', {
    className: 'container-fluid'
  }, redirect, backHome);
}
