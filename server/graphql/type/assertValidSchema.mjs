/**
 * Asserts a schema is valid by throwing an error if it is invalid.
 */

import { validateSchema } from './validateSchema.mjs';

export function assertValidSchema(schema) {
  const errors = validateSchema(schema);

  if (errors.length !== 0) {
    throw new Error(errors.map(error => error.message).join('\n\n'));
  }
}
