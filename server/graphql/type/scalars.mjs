import { isNamedType } from './definition.mjs';
import { GraphQLString  } from './scalars/GraphQLString.mjs';
import { GraphQLInt } from './scalars/GraphQLInt.mjs';
import { GraphQLFloat } from './scalars/GraphQLFloat.mjs';
import { GraphQLBoolean } from './scalars/GraphQLBoolean.mjs';
import { GraphQLID  } from './scalars/GraphQLID.mjs';

export {
  GraphQLString, 
  GraphQLInt, 
  GraphQLFloat, 
  GraphQLBoolean, 
  GraphQLID
}

export const specifiedScalarTypes = [
  GraphQLString, 
  GraphQLInt, 
  GraphQLFloat, 
  GraphQLBoolean, 
  GraphQLID
];

export function isSpecifiedScalarType(type) {
  return isNamedType(type) && ( 
    // Would prefer to use specifiedScalarTypes.some(), 
    // however %checks needs a simple expression.
    type.name === GraphQLString.name || 
    type.name === GraphQLInt.name || 
    type.name === GraphQLFloat.name || 
    type.name === GraphQLBoolean.name || 
    type.name === GraphQLID.name
  );
}
