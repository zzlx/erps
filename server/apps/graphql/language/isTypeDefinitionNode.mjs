import { Kind } from './Kind.mjs';

export function isTypeDefinitionNode(node) {
  return (
    node.kind === Kind.SCALAR_TYPE_DEFINITION || 
    node.kind === Kind.OBJECT_TYPE_DEFINITION || 
    node.kind === Kind.INTERFACE_TYPE_DEFINITION || 
    node.kind === Kind.UNION_TYPE_DEFINITION || 
    node.kind === Kind.ENUM_TYPE_DEFINITION || 
    node.kind === Kind.INPUT_OBJECT_TYPE_DEFINITION
  );
}
