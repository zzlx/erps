/**
 * Given a string containing a GraphQL value (ex. `[42]`), 
 * parse the AST for that value.
 * Throws GraphQLError if a syntax error is encountered.
 *
 * This is useful within tools that operate upon GraphQL Values directly 
 * and in isolation of complete GraphQL documents.
 *
 * Consider providing the results to the utility function: valueFromAST().
 */

import { Source } from './Source.mjs';
import { Lexer } from './Lexer.mjs';

export function parseValue(source, options = {}) {

  const sourceObj = typeof source === 'string' ? new Source(source) : source;
  const lexer = new Lexer(sourceObj, options);

  expect(lexer, TokenKind.SOF);
  const value = parseValueLiteral(lexer, false);
  expect(lexer, TokenKind.EOF);

  return value;
}

