/**
 * Determines if a field should be included,
 * based on the @include and @skip directives, 
 * where @skip has higher precedence(优先) than @include.
 */

export function shouldIncludeNode(exeContext, node) {
  const skip = getDirectiveValues(
    GraphQLSkipDirective, 
    node, 
    exeContext.variableValues
  );

  if (skip && skip.if === true) {
    return false;
  }

  const include = getDirectiveValues(
    GraphQLIncludeDirective, 
    node, 
    exeContext.variableValues
  );

  if (include && include.if === false) { return false; }

  return true;
}
