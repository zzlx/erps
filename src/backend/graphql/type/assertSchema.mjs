import { assert, inspect } from '../../utils.lib.mjs';
import { isSchema } from './isSchema.mjs';

export function assertSchema(schema) {
	assert (
    isSchema(schema),
    "Expected ".concat(inspect(schema), " to be a GraphQL schema."),
  );

  return schema;
}
