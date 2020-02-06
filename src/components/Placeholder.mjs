/**
 *
 *
 */

import React from 'react';
import randomInt from '../utils/randomInt.mjs';

export default function Placeholder(props) {
  const { className, row, children, ...rests } = props;

  const cn = [
    'placeholder',
    className,
  ].filter(Boolean).join(' ');

  const sizes = ['xsmall', 'small', 'medium', 'large', 'full'];

  const num = row || 5;
  const rows = [];

  for (let i = 0; num; i++) {
    const index = randomInt(0,sizes.length);
    const row = React.createElement('p', {
      key: i,
      className: 'placeholder_' + sizes[index],
    }, "\xA0"); 

    rows.push(row);
  }

  return React.createElement('div', {
    className: cn,
    ...rests,
  }, children, rows);
}
