/**
 * Implements the logic to compute the key of a given field's entry
 */

export function getFieldEntryKey(node) {
  return node.alias ? node.alias.value : node.name.value;
}
