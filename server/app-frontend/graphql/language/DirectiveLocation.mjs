/**
 * *****************************************************************************
 *
 * The set of allowed directive location values.
 *
 * *****************************************************************************
 */

export const DirectiveLocation = Object.freeze({

  // Request Definitions
  QUERY: 'QUERY',
  MUTATION: 'MUTATION',
  SUBSCRIPTION: 'SUBSCRIPTION',
  FIELD: 'FIELD',
  FRAGMENT_DEFINITION: 'FRAGMENT_DEFINITION', // 片段定义
  FRAGMENT_SPREAD: 'FRAGMENT_SPREAD',         // 片段扩展符
  INLINE_FRAGMENT: 'INLINE_FRAGMENT',         // 行内片段
  VARIABLE_DEFINITION: 'VARIABLE_DEFINITION',

  // Type System Definitions
  SCHEMA: 'SCHEMA',
  SCALAR: 'SCALAR',
  OBJECT: 'OBJECT',
  FIELD_DEFINITION: 'FIELD_DEFINITION',
  ARGUMENT_DEFINITION: 'ARGUMENT_DEFINITION',
  INTERFACE: 'INTERFACE',
  UNION: 'UNION',
  ENUM: 'ENUM',
  ENUM_VALUE: 'ENUM_VALUE',
  INPUT_OBJECT: 'INPUT_OBJECT',
  INPUT_FIELD_DEFINITION: 'INPUT_FIELD_DEFINITION'

});
