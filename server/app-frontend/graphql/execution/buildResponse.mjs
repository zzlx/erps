/**
 * Given a completed execution context and data, 
 * build the response defined by the "Response" section of the GraphQL specification.
 */

import { isPromise } from '../../utils/isPromise.mjs';

export function buildResponse(exeContext, data) {
  if (isPromise(data)) {
    return data.then(resolved => buildResponse(exeContext, resolved));
  }

  return exeContext.errors.length === 0 
    ? { data: data } 
    : { errors: exeContext.errors, data: data };
}
