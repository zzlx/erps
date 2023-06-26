/**
 * Complete a Scalar or Enum by serializing to a valid value,
 * returning null if serialization is not possible.
 */

import { assert } from '../../utils/assert.mjs';
import { isInvalid } from '../../utils/isInvalid.mjs';
import { inspect } from '../../utils/inspect.mjs';

export function completeLeafValue(returnType, result) {
  assert(returnType.serialize, 'Missing serialize method on type.');

  const serializedResult = returnType.serialize(result);

  if (isInvalid(serializedResult)) {
    throw new Error(
      `Expected a value of type ${inspect(returnType)} but received: ${inspect(result)}`
    );
  }

  return serializedResult;
}
