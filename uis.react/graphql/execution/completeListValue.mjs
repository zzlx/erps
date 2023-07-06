/**
 * Complete a list value by completing each item in the list with the
 * inner type
 */

import { assert } from '../../utils/assert.mjs';
import { iterall } from '../../utils/iterall.mjs';
import { isPromise } from '../../utils/isPromise.mjs';
import { completeValueCatchingError } from './completeValueCatchingError.mjs';

export function completeListValue(
  context, 
  returnType, 
  fieldNodes, 
  info, 
  path, 
  result
) {
  assert(
    iterall.isCollection(result), 
    "Expected Iterable, but did not find one for field "
      .concat(info.parentType.name, ".")
      .concat(info.fieldName, ".")
  );

  // This is specified as a simple map, however we're optimizing the path
  // where the list contains no Promises by avoiding creating another Promise.

  const itemType = returnType.ofType;
  const completedResults = [];
  let containsPromise = false;

  iterall.forEach(result, (item, index) => {
    // No need to modify the info object containing the path,
    // since from here on it is not ever accessed by resolver functions.
    const fieldPath = addPath(path, index);
    const completedItem = completeValueCatchingError(
      context, 
      itemType, 
      fieldNodes, 
      info, 
      fieldPath, 
      item
    );

    if (!containsPromise && isPromise(completedItem)) containsPromise = true;

    completedResults.push(completedItem);
  });

  return containsPromise ? Promise.all(completedResults) : completedResults;
}
