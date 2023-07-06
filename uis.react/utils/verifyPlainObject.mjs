import { isPlainObject } from './is/isPlainObject.mjs'
import { warning } from './warning.mjs'

export function verifyPlainObject(value, displayName, methodName) {
  if (!isPlainObject(value)) {
    warning(
      `${methodName}() in ${displayName} must return a plain object. Instead received ${value}.`
    )
  }
}
