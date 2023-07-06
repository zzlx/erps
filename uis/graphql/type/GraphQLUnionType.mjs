/**
 * *****************************************************************************
 *
 * Union Type Definition
 *
 * When a field can return one of a heterogeneous set of types, a Union type
 * is used to describe what types are possible as well as providing a function
 * to determine which type is actually used when the field is resolved.
 *
 * Example:
 *
 *     const PetType = new GraphQLUnionType({
 *       name: 'Pet',
 *       types: [ DogType, CatType ],
 *       resolveType(value) {
 *         if (value instanceof Dog) {
 *           return DogType;
 *         }
 *         if (value instanceof Cat) {
 *           return CatType;
 *         }
 *       }
 *     });
 *
 * *****************************************************************************
 */

import { assert } from '../../utils/assert.mjs';
import { defineToStringTag } from '../../utils/defineToStringTag.mjs';
import { defineToJSON } from '../../utils/defineToJSON.mjs';
import { inspect } from '../../utils/inspect.mjs';

export class GraphQLUnionType {
  constructor(config) {
    this.name = config.name;
    this.description = config.description;
    this.astNode = config.astNode;
    this.extensionASTNodes = config.extensionASTNodes;
    this.resolveType = config.resolveType;
    this._types = defineTypes.bind(undefined, config);
    !(typeof config.name === 'string') ? assert(0, 'Must provide name.') : void 0;
    !(config.resolveType == null || typeof config.resolveType === 'function') ? assert(0, "".concat(this.name, " must provide \"resolveType\" as a function, ") + "but got: ".concat(inspect(config.resolveType), ".")) : void 0;
  }


  getTypes() {
    if (typeof this._types === 'function') {
      this._types = this._types();
    }

    return this._types;
  }

  toString() {
    return this.name;
  }
}

// Conditionally apply `[Symbol.toStringTag]` if `Symbol`s are supported
defineToStringTag(GraphQLUnionType);
defineToJSON(GraphQLUnionType);

function defineTypes(config) {
  const resolveThunk = thunk => typeof thunk === 'function' ? thunk() : thunk;
  const types = resolveThunk(config.types) || [];
  !Array.isArray(types) 
    ? assert(0, 'Must provide Array of types or a function which returns ' + 
      "such an array for Union ".concat(config.name, ".")) 
    : void 0;
  return types;
}
