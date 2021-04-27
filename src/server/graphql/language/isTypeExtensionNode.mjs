import { Kind } from './Kind.mjs';

export function isTypeExtensionNode(node) {
  return (
    node.kind === Kind.SCALAR_TYPE_EXTENSION || 
    node.kind === Kind.OBJECT_TYPE_EXTENSION || 
    node.kind === Kind.INTERFACE_TYPE_EXTENSION || 
    node.kind === Kind.UNION_TYPE_EXTENSION || 
    node.kind === Kind.ENUM_TYPE_EXTENSION || 
    node.kind === Kind.INPUT_OBJECT_TYPE_EXTENSION
  );
}
