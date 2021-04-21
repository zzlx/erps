import { isNonNullType } from './isNonNullType.mjs';

export function isRequiredArgument(arg) {
  return isNonNullType(arg.type) && arg.defaultValue === undefined;
}
