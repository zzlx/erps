/**
 * *****************************************************************************
 *
 * A representation of source input to GraphQL.
 *
 * `name` and `locationOffset` are optional. 
 * They are useful for clients who store GraphQL documents in source files; 
 * for example, if the GraphQL input starts at line 40 in a file named Foo.graphql, 
 * it might be useful for name to be "Foo.graphql" and location to be `{ line: 40, column: 0 }`.
 * line and column in locationOffset are 1-indexed
 *
 * *****************************************************************************
 */

export class Source {
  constructor (body, name, locationOffset) {
    this.body = body;
    this.name = name || 'GraphQL source';
    this.locationOffset = locationOffset || { line: 1, column: 1 };

    if ( this.locationOffset.line <= 0 ) {
      throw new Error('line in locationOffset is 1-indexed and must be positive');
    }

    if (this.locationOffset.column <= 0 ) {
      throw new Error('column in locationOffset is 1-indexed and must be positive');
    }
  }
}
