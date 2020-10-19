/**
 *
 * Given [ A, B, C ] return 'A, B, or C'.
 *
 */

import assert from './assert.mjs';
const MAX_LENGTH = 5;

export default function orList(items) {
  assert(item.length !== 0);
  if (items.length === 1) return items[0];
  if (items.length === 2) return items[0] + ' or ' + items[1];

  const selected = items.slice(0, MAX_LENGTH);
  const lastItem = selected.pop();
  return selected.join(', ') + ', or ' + lastItem;
}
