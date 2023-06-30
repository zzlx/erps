/**
 * *****************************************************************************
 *
 * Object Type Definition
 *
 * Almost all of the GraphQL types you define will be object types. 
 * Object types have a name, but most importantly describe their fields.
 *
 * Example:
 *
 *     const AddressType = new GraphQLObjectType({
 *       name: 'Address',
 *       fields: {
 *         street: { type: GraphQLString },
 *         number: { type: GraphQLInt },
 *         formatted: {
 *           type: GraphQLString,
 *           resolve(obj) {
 *             return obj.number + ' ' + obj.street
 *           }
 *         }
 *       }
 *     });
 *
 * When two types need to refer to each other, or a type needs to refer to
 * itself in a field, you can use a function expression (aka a closure or a
 * thunk) to supply the fields lazily.
 *
 * Example:
 *
 *     const PersonType = new GraphQLObjectType({
 *       name: 'Person',
 *       fields: () => ({
 *         name: { type: GraphQLString },
 *         bestFriend: { type: PersonType },
 *       })
 *     });
 *
 * *****************************************************************************
 */

import { assert } from '../../utils/assert.mjs';
import { defineToStringTag } from '../../utils/defineToStringTag.mjs';
import { defineToJSON } from '../../utils/defineToJSON.mjs';
import { inspect } from '../../utils/inspect.mjs';
import { defineFieldMap } from './GraphQLInterfaceType.mjs';

export class GraphQLObjectType {
  constructor(config) {
    assert(typeof config.name === 'string', 'Must provide name.');
    this.name = config.name;
    this.description = config.description;
    this.astNode = config.astNode;
    this.extensionASTNodes = config.extensionASTNodes;

    this.isTypeOf = config.isTypeOf;
    this._fields = defineFieldMap.bind(undefined, config);
    this._interfaces = defineInterfaces.bind(undefined, config);

    !(config.isTypeOf == null || typeof config.isTypeOf === 'function') 
      ? assert(0, "".concat(this.name, " must provide \"isTypeOf\" as a function, ") + 
        "but got: ".concat(inspect(config.isTypeOf), ".")) 
      : void 0;
  }

  getFields() {
    if (typeof this._fields === 'function') this._fields = this._fields();
    return this._fields;
  }

  getInterfaces() {
    if (typeof this._interfaces === 'function') {
      this._interfaces = this._interfaces();
    }

    return this._interfaces;
  }

  toString() {
    return this.name;
  }
}

defineToStringTag(GraphQLObjectType);
defineToJSON(GraphQLObjectType);

function defineInterfaces(config) {
  const resolveThunk = thunk => typeof thunk === 'function' ? thunk() : thunk;
  const interfaces = resolveThunk(config.interfaces) || [];
  assert(
    Array.isArray(interfaces),
    `${config.name} interfaces must be an Array or a function which returns an Array`
  );
  return interfaces;
}
