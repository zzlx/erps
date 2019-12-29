/**
 * @param {Object} opts
 */

import React from 'react';
import Markable from 'remarkable';

export default function Markdown (opts = {}) {
  const markdown = new Markable('commonmark');
  const $$typeof = Symbol.for('react.element');
  let type = 'div';
  let props = opts;

  if (opts.$$typeof === $$typeof) {
    type = opts.type
    props = opts.props;
  }

  const { children, ...rests} = props;

  return React.createElement(type, {
    ...rests,
    dangerouslySetInnerHTML: {__html: markdown.render(children)},
  });
} 
