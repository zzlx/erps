import { Kind } from './Kind.mjs';

export function isValueNode(node) {
  return (
    node.kind === Kind.VARIABLE || 
    node.kind === Kind.INT || 
    node.kind === Kind.FLOAT || 
    node.kind === Kind.STRING || 
    node.kind === Kind.BOOLEAN || 
    node.kind === Kind.NULL || 
    node.kind === Kind.ENUM || 
    node.kind === Kind.LIST || 
    node.kind === Kind.OBJECT
  );
}
