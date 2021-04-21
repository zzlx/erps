import { Kind } from './Kind.mjs';
import { isTypeExtensionNode } from './isTypeExtensionNode.mjs';

export function isTypeSystemExtensionNode(node) {
  return (
    node.kind === Kind.SCHEMA_EXTENSION || 
    isTypeExtensionNode(node)
  );
}
