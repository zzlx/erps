import { isNamedType } from './isNamedType.mjs';
import { GraphQLString  } from './GraphQLString.mjs';
import { GraphQLInt } from './GraphQLInt.mjs';
import { GraphQLFloat } from './GraphQLFloat.mjs';
import { GraphQLBoolean } from './GraphQLBoolean.mjs';
import { GraphQLID  } from './GraphQLID.mjs';
import { specifiedScalarTypes } from './specifiedScalarTypes.mjs';

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
