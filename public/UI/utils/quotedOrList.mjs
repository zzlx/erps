/**
 * Given [ A, B, C ] return '"A", "B", or "C"'.
 */

import { orList } from './orList.mjs';

export function quotedOrList(items) {
  return orList(items.map(item => "\"".concat(item, "\"")));
}
