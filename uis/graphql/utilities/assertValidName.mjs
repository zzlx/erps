/**
 * Upholds the spec rules about naming.
 */

import { isValidNameError } from './isValidNameError.mjs';

export function assertValidName(name) {
  const error = isValidNameError(name);

  if (error) { throw error; }

  return name;
}
