/**
 * Given [ A, B, C ] return '"A", "B", or "C"'.
 */

import orList from './orList.mjs';

export default function quotedOrList(items) {
  return orList(items.map(function (item) {
    return "\"".concat(item, "\"");
  }));
}
