/**
 * Implements the instructions for completeValue as defined in the
 * "Field entries" section of the spec.
 *
 * If the field type is Non-Null, then this recursively completes the value
 * for the inner type. It throws a field error if that completion returns null,
 * as per the "Nullability" section of the spec.
 *
 * If the field type is a List, then this recursively completes the value
 * for the inner type on each item in the list.
 *
 * If the field type is a Scalar or Enum, ensures the completed value is a legal
 * value of the type by calling the `serialize` method of GraphQL type
 * definition.
 *
 * If the field is an abstract type, determine the runtime type of the value
 * and then complete based on that type
 *
 * Otherwise, the field type expects a sub-selection set, and will complete the
 * value by evaluating all sub-selections.
 */

export function completeValue(context, returnType, fieldNodes, info, path, result) {
  // If result is an Error, throw a located error.
  if (result instanceof Error) {
    throw result;
  } // If field type is NonNull, complete for inner type, and throw field error
  // if result is null.


  if (isNonNullType(returnType)) {
    const completed = completeValue(
      context, 
      returnType.ofType, 
      fieldNodes, 
      info, 
      path, 
      result
    );

    if (completed === null) {
      throw new Error(
        "Cannot return null for non-nullable field ".concat(info.parentType.name, ".").concat(info.fieldName, ".")
      );
    }

    return completed;
  } // If result value is null-ish (null, undefined, or NaN) then return null.


  if (isNullish(result)) {
    return null;
  } // If field type is List, complete each item in the list with the inner type


  if (isListType(returnType)) {
    return completeListValue(
      context, 
      returnType, 
      fieldNodes, 
      info, 
      path, 
      result
    );
  } // If field type is a leaf type, Scalar or Enum, serialize to a valid value,
  // returning null if serialization is not possible.


  if (isLeafType(returnType)) {
    return completeLeafValue(returnType, result);
  } 

  // If field type is an abstract type, Interface or Union, determine the
  // runtime Object type and complete for that type.
  if (isAbstractType(returnType)) {
    return completeAbstractValue(
      context, 
      returnType, 
      fieldNodes, 
      info, 
      path, 
      result
    );
  } 

  // If field type is Object, execute and complete all sub-selections.
  if (isObjectType(returnType)) {
    return completeObjectValue(context, returnType, fieldNodes, info, path, result);
  } 

  // Not reachable. All possible output types have been considered.
  /* istanbul ignore next */

  throw new Error(
    `Cannot complete value of unexpected type "${inspect(returnType)}".`
  );
}
