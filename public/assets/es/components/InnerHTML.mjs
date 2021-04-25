/**
 * *****************************************************************************
 *
 * Inner html container
 *
 * *****************************************************************************
 */

import { React } from './React.mjs';

export function InnerHTML (props) {
  return React.createElement('div', {
    dangerouslySetInnerHTML: { __html: 'content'}
  });
}
