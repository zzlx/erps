/**
 * *****************************************************************************
 *
 *
 * *****************************************************************************
 */

export function getIntrospectionQuery(options) {
  const descriptions = !(options && options.descriptions === false);

  return `
  query IntrospectionQuery {
    __schema {
      queryType { name }
      mutationType { name }
      subscriptionType { name }
      types {
        ...FullType
      }
      directives {
        name${descriptions ? '\ndescription\n' : ''}
        locations
        args {
          ...InputValue
        }
      }
    }
  }

  fragment FullType on __Type {
    kind
    name${descriptions ? '\ndescription\n' : ''}
    fields(includeDeprecated: true) {
      name${descriptions ? '\ndescription\n' : ''}
      args {
        ...InputValue
      }
      type {
        ...TypeRef
      }
      isDeprecated
      deprecationReason
    }
    inputFields {
      ...InputValue
    }
    interfaces {
      ...TypeRef
    }
    enumValues(includeDeprecated: true) {
      name${descriptions ? '\ndescription\n' : ''}
      isDeprecated
      deprecationReason
    }
    possibleTypes {
      ...TypeRef
    }
  }

  fragment InputValue on __InputValue {
    name${descriptions ? '\ndescription\n' : ''}
    type { 
      ...TypeRef 
    }
    defaultValue
  }

  fragment TypeRef on __Type {
    kind
    name
    ofType {
      kind
      name
      ofType {
        kind
        name
        ofType {
          kind
          name
          ofType {
            kind
            name
            ofType {
              kind
              name
              ofType {
                kind
                name
                ofType {
                  kind
                  name
                }
              }
            }
          }
        }
      }
    }
  }
  `;
}
