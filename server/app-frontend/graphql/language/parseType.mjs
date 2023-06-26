/**
 *
 * Parse Type
 *
 * Given a string containing a GraphQL Type (ex. `[Int!]`), 
 * parse the AST for that type.
 * Throws GraphQLError if a syntax error is encountered.
 *
 * This is useful within tools that operate upon GraphQL Types directly and
 * in isolation of complete GraphQL documents.
 *
 * Consider providing the results to the utility function: typeFromAST().
 */

export function parseType(source, options) {
  const sourceObj = typeof source === 'string' ? new Source(source) : source;
  const lexer = new Lexer(sourceObj, options || {});

  expect(lexer, TokenKind.SOF);
  const type = parseTypeReference(lexer);
  expect(lexer, TokenKind.EOF);

  return type;
}
