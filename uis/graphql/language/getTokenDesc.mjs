/**
 * A helper function to describe a token as a string for debugging
 */

export function getTokenDesc(token) {
  return token.value ? token.kind + ' ' + token.value : token.kind;
}
