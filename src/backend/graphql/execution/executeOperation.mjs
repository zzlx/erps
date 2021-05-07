/**
 * Implements the "Evaluating operations" section of the spec.
 */

export function executeOperation(exeContext, operation, rootValue) {
  const type = getOperationRootType(exeContext.schema, operation);

  const fields = collectFields(
    exeContext, 
    type, 
    operation.selectionSet, 
    Object.create(null), 
    Object.create(null)
  );

  let path = undefined; 

  // Errors from sub-fields of a NonNull type may propagate to the top level,
  // at which point we still log the error and null the parent field, which
  // in this case is the entire response.
  // Similar to completeValueCatchingError.
  try {
    // 并行执行查询，序列化执行变更操作，以避免竞态
    const result = operation.operation === 'mutation' 
      ? executeFieldsSerially(exeContext, type, rootValue, path, fields) 
      : executeFields(exeContext, type, rootValue, path, fields);

    if (isPromise(result)) {
      return result.then(undefined, (error) => {
        exeContext.errors.push(error);
        return Promise.resolve(null);
      });
    }

    return result;
  } catch (error) {
    exeContext.errors.push(error);
    return null;
  }
}
