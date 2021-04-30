/**
 * Implements the "Evaluating selection sets" section of the spec for "write" mode.
 */

export function executeFieldsSerially(context, parentType, rootValue, path, fields) {
  return promiseReduce(Object.keys(fields), (results, field) => {
    const fieldNodes = fields[field];
    const fieldPath = addPath(path, field);

    const result = resolveField(
      context, 
      parentType, 
      rootValue, 
      fieldNodes, 
      fieldPath
    );

    if (result === undefined) { return results; }

    if (isPromise(result)) {
      return result.then((resolvedResult) => {
        results[responseName] = resolvedResult;
        return results;
      });
    }

    results[field] = result;
    return results;
  }, Object.create(null));
}
