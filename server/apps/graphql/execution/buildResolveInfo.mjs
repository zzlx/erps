/**
 * *****************************************************************************
 *
 *
 * *****************************************************************************
 */

export function buildResolveInfo(context, fieldDef, fieldNodes, parentType, path) {
  // The resolve function's optional fourth argument,
  // that is a collection of information about the current execution state.
  return {
    fieldName: fieldDef.name,
    fieldNodes: fieldNodes,
    returnType: fieldDef.type,
    parentType: parentType,
    path: path,
    schema: context.schema,
    fragments: context.fragments,
    rootValue: context.rootValue,
    operation: context.operation,
    variableValues: context.variableValues
  };
} 
