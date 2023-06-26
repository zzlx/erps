/**
 * Deprecated. Use coerceValue() directly for richer information.
 *
 * This function will be removed in v15
 */

import { coerceValue } from './coerceValue.mjs';

export function isValidJSValue(value, type) {
  const errors = coerceValue(value, type).errors;
  return errors ? errors.map(function (error) {
    return error.message;
  }) : [];
}
