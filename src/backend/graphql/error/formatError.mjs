/**
 * *****************************************************************************
 *
 * Given a GraphQLError, 
 * format it according to the rules described by the Response Format,
 * Errors section of the GraphQL Specification.
 *
 * *****************************************************************************
 */

export function formatError(error) {
	if (!error) {
		throw new Error('Received null or undefined error.');
	}

  const message    = error.message || 'An unknown error occurred.';
  const locations  = error.locations;
  const path       = error.path;
  const extensions = error.extensions;

  return extensions 
    ? { message, locations, path, extensions } 
    : { message, locations, path };
}
