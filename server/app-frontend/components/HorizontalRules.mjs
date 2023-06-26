/**
 * *****************************************************************************
 *
 *
 * *****************************************************************************
 */

import React from './React.mjs';
import RawHtml from './RawHtml.mjs';

export default function HorizontalRules (props) {
  return React.createElement(RawHtml, null, `
<hr>
<hr class="text-success"> 
<hr class="text-danger border-2 opacity-50">
<hr class="border-primary border-3 opacity-75">
  `);
}
