/**
 * *****************************************************************************
 *
 * Prepares an object map of argument values given a directive definition
 * and a AST node which may contain directives. 
 * Optionally also accepts a map of variable values.
 *
 * If the directive does not exist on the node, returns undefined.
 *
 * Note: 
 * The returned value is a plain Object with a prototype, since it is exposed to user code.
 * Care should be taken to not pull values from the Object prototype.
 *
 * *****************************************************************************
 */

import { getArgumentValues } from './getArgumentValues.mjs';

export function getDirectiveValues(directiveDef, node, variableValues) {
  const directiveNode = node.directives && Array.prototype.find.call(
    node.directives, 
    directive => directive.name.value === directiveDef.name
  );

  if (directiveNode) {
    return getArgumentValues(directiveDef, directiveNode, variableValues);
  }
}
