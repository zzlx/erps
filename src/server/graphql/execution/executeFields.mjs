/**
 * Implements the "Evaluating selection sets" section of the spec for "read" mode.
 */

export function executeFields(exeContext, parentType, rootValue, path, fields) {
  const results = Object.create(null);
  let containsPromise = false;

  for (let i = 0, keys = Object.keys(fields); i < keys.length; ++i) {
    const field = keys[i];
    const fieldNodes = fields[field];
    const fieldPath = addPath(path, field);

    const result = resolveField(
      exeContext, 
      parentType, 
      rootValue, 
      fieldNodes, 
      fieldPath
    );

    if (result !== undefined) {
      results[field] = result;

      if (!containsPromise && isPromise(result)) {
        containsPromise = true;
      }
    }
  } 

  // If there are no promises, we can just return the object
  if (!containsPromise) {
    return results;
  } 

  // Otherwise, 
  // results is a map from field name to the result of resolving that field, 
  // which is possibly a promise. 
  // Return a promise that will return this same map, 
  // but with any promises replaced with the values they resolved to.
  return promiseForObject(results);
}
