import { Kind } from './Kind.mjs';

export function isTypeNode(node) {
  return (
    node.kind === Kind.NAMED_TYPE || 
    node.kind === Kind.LIST_TYPE || 
    node.kind === Kind.NON_NULL_TYPE
  );
}
