/**
 * *****************************************************************************
 *
 * Inner html container
 *
 * *****************************************************************************
 */

import React from './_React.mjs';

export default function InnerHTML (props) {
  return React.createElement('div', {
    dangerouslySetInnerHTML: { __html: 'content'}
  });
}
