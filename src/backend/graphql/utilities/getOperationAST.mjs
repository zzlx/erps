/**
 * Returns an operation AST given a document AST and optionally an operation name. 
 * If a name is not provided, 
 * an operation is only returned if only one is provided in the document.
 *
 *
 *
 *
 */

import { Kind } from '../language/index.mjs';

export function getOperationAST(documentAST, operationName) {
  let operation = null;

  for (let i = 0; i < documentAST.definitions.length; i++) {
    const definition = documentAST.definitions[i];

    if (definition.kind === Kind.OPERATION_DEFINITION) {
      if (!operationName) {
        // If no operation name was provided, 
        // only return an Operation if there is one defined in the document. 
        // Upon encountering the second, return null.
        if (operation) {
          return null;
        }

        operation = definition;
      } else if (definition.name && definition.name.value === operationName) {
        return definition;
      }
    }
  }

  return operation;
}
