// Isolates the "ReturnOrAbrupt" behavior to not de-opt the `resolveField`
// function. Returns the result of resolveFn or the abrupt-return Error object.
export function resolveFieldValueOrError(
  exeContext, fieldDef, fieldNodes, resolveFn, rootValue, info
) {
  try {
    // Build a JS object of arguments from the field.arguments AST, using the
    // variables scope to fulfill any variable references.
    // TODO: find a way to memoize, in case this field is within a List type.
    const args = getArgumentValues(fieldDef, fieldNodes[0], exeContext.variableValues); 

    // The resolve function's optional third argument is a context value 
    // that is provided to every resolve function within an execution. 
    // It is commonly used to represent an authenticated user, 
    // or request-specific caches.
    const _contextValue = exeContext.contextValue;

    // 执行resolve函数
    const result = resolveFn(rootValue, args, _contextValue, info);

    // 处理潜在的promise result
    return isPromise(result)? result.then(undefined, asErrorInstance) : result;

  } catch (error) {
    return asErrorInstance(error);
  }
} 

// Sometimes a non-error is thrown, wrap it as an Error instance to ensure a
// consistent Error interface.

function asErrorInstance(error) {
  return error instanceof Error ? error : new Error(error || undefined);
} 
