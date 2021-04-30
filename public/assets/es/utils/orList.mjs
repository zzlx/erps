/**
 * *****************************************************************************
 *
 * Given [ A, B, C ] return 'A, B, or C'.
 *
 * *****************************************************************************
 */

export function orList(items, MAX_LENGTH = 5) {
  if (items.length === 0) throw new Error('orList item length is 0');

  if (items.length === 1) return items[0];
  if (items.length === 2) return items[0] + ' or ' + items[1];

  const selected = items.slice(0, MAX_LENGTH);
  const lastItem = selected.pop();
  return selected.join(', ') + ', or ' + lastItem;
}
