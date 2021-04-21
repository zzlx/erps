import { isNamedType } from './isNamedType.mjs';
import { __Schema } from './__Schema.mjs';
import { __Directive } from './__Directive.mjs';
import { __DirectiveLocation } from './__DirectiveLocation.mjs';
import { __Type } from './__Type.mjs';
import { __Field } from './__Field.mjs';
import { __InputValue } from './__InputValue.mjs';
import { __EnumValue } from './__EnumValue.mjs';
import { __TypeKind } from './__TypeKind.mjs';

// introspection
export function isIntrospectionType(type) {
  return isNamedType(type) && ( 
  // Would prefer to use introspectionTypes.some(), however %checks needs
  // a simple expression.
    type.name === __Schema.name || 
    type.name === __Directive.name || 
    type.name === __DirectiveLocation.name || 
    type.name === __Type.name || 
    type.name === __Field.name || 
    type.name === __InputValue.name || 
    type.name === __EnumValue.name || 
    type.name === __TypeKind.name
  );
}
