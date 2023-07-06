import { assert } from '../../utils/assert.mjs';
import { inspect } from '../../utils/inspect.mjs';
import { isSchema } from './isSchema.mjs';

export function assertSchema(schema) {
	assert (
    isSchema(schema),
    "Expected ".concat(inspect(schema), " to be a GraphQL schema."),
  );

  return schema;
}
