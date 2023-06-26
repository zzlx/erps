/**
 *
 *
 */

const nameRegexp = /^[_a-zA-Z][_a-zA-Z0-9]*$/;

export function isValidName(value) {
  return nameRegexp.test(String(value));
}

