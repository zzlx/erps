/**
 *
 *
 *
 *
 */

import React from 'react';
import {
  Clock,
  Redirect,
} from '../components/index.mjs';

export default function NotFound (props) {
  document.title = 'Error:404';
  const clock = React.createElement(Clock);
  const redirect = React.createElement(Redirect, {to: '/home'});
  return React.createElement('div', null, clock, redirect);
}
