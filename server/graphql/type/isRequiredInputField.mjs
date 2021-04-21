import { isNonNullType } from './isNonNullType.mjs';

export function isRequiredInputField(field) {
  return isNonNullType(field.type) && field.defaultValue === undefined;
}
