/**
 * Provided a collection of ASTs, presumably each from different files,
 * concatenate the ASTs together into batched AST, useful for validating many
 * GraphQL source files which together represent one conceptual application.
 */

export function concatAST(asts) {
  const batchDefinitions = [];

  for (let i = 0; i < asts.length; i++) {
    const definitions = asts[i].definitions;

    for (let j = 0; j < definitions.length; j++) {
      batchDefinitions.push(definitions[j]);
    }
  }

  return {
    kind: 'Document',
    definitions: batchDefinitions
  };
}
