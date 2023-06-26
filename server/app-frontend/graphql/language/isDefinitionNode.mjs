/**
 * *****************************************************************************
 *
 * predicate
 *
 * *****************************************************************************
 */


import { isExecutableDefinitionNode } from './isExecutableDefinitionNode.mjs';
import { isTypeSystemDefinitionNode } from './isTypeSystemDefinitionNode.mjs';
import { isTypeSystemExtensionNode } from './isTypeSystemExtensionNode.mjs';

export function isDefinitionNode(node) {
  return (
    isExecutableDefinitionNode(node) || 
    isTypeSystemDefinitionNode(node) || 
    isTypeSystemExtensionNode(node)
  );
}
