/**
 * Build an IntrospectionQuery from a GraphQLSchema
 *
 * IntrospectionQuery is useful for utilities that care about type and field
 * relationships, but do not need to traverse through those relationships.
 *
 * This is the inverse of buildClientSchema. The primary use case is outside
 * of the server context, for instance when doing schema comparisons.
 */

import { getIntrospectionQuery } from './getIntrospectionQuery.mjs';
import { execute } from '../execution/index.mjs';
import { parse } from '../language/index.mjs';

export function introspectionFromSchema(schema, options) {
  var queryAST = parse(getIntrospectionQuery(options));
  var result = execute(schema, queryAST);

	if (!(!result.then && !result.errors && result.data)) {
		throw new Error('检测到Schema错误!');
	}

  return result.data;
}















