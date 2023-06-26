
/**
 * Returns an Error if a name is invalid.
 */

const NAME_RX = /^[_a-zA-Z][_a-zA-Z0-9]*$/;
import { GraphQLError } from '../error/index.mjs';

export function isValidNameError(name, node) {

	if (typeof name !== 'string') {
		throw new TypeError('Expected string name.');
	}

  if (name.length > 1 && name[0] === '_' && name[1] === '_') {
    return new GraphQLError(
      "Name \"".concat(name, "\" must not begin with \"__\", which is reserved by ") + 'GraphQL introspection.', 
      node
    );
  }

  if (!NAME_RX.test(name)) {
    return new GraphQLError(
      "Names must match /^[_a-zA-Z][_a-zA-Z0-9]*$/ but \"".concat(name, "\" does not."), 
      node
    );
  }
}
