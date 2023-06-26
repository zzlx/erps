import { Kind } from './Kind.mjs';

export function isExecutableDefinitionNode(node) {
  return (
    node.kind === Kind.OPERATION_DEFINITION || 
    node.kind === Kind.FRAGMENT_DEFINITION
  );
}
