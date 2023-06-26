/**
 * Resolves the field on the given source object. 
 * In particular, 
 * this figures out the value that the field returns by calling its resolve function,
 * then calls completeValue to complete promises, serialize scalars, 
 * or execute the sub-selection-set for objects.
 */

export function resolveField(exeContext, parentType, rootValue, fieldNodes, path) {
  const fieldNode = fieldNodes[0];
  const fieldName = fieldNode.name.value;
  const fieldDef = getFieldDef(exeContext.schema, parentType, fieldName);

  if (!fieldDef) {
    return;
  }

  // fieldDef.resolve || fieldResolver
  // @todo: 如何使用resolver
  const resolveFn = fieldDef.resolve || exeContext.fieldResolver[parentType][fieldName];
  const info = buildResolveInfo(exeContext, fieldDef, fieldNodes, parentType, path); 

  // Get the resolve function, regardless of if its result is normal or abrupt.
  const result = resolveFieldValueOrError(
    exeContext, 
    fieldDef, 
    fieldNodes, 
    resolveFn, 
    rootValue, 
    info
  );

  return completeValueCatchingError(
    exeContext, 
    fieldDef.type, 
    fieldNodes, 
    info, 
    path, 
    result
  );
}
