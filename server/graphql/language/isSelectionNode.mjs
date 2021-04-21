import { Kind } from './Kind.mjs';

export function isSelectionNode(node) {
  return (
    node.kind === Kind.FIELD || 
    node.kind === Kind.FRAGMENT_SPREAD || 
    node.kind === Kind.INLINE_FRAGMENT
  );
}
