import { Kind } from './Kind.mjs';
import { isTypeDefinitionNode } from './isTypeDefinitionNode.mjs';

export function isTypeSystemDefinitionNode(node) {
  return (
    node.kind === Kind.SCHEMA_DEFINITION || 
    isTypeDefinitionNode(node) || 
    node.kind === Kind.DIRECTIVE_DEFINITION
  );
}
