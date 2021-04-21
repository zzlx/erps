/**
 * Given a ResponsePath 
 * (found in the `path` entry,
 * in the information provided as the last argument to a field resolver), 
 * return an Array of the path keys.
 */

export function responsePathAsArray(path) {
  const flattened = [];
  let curr = path;

  while (curr) {
    flattened.push(curr.key);
    curr = curr.prev;
  }

  return flattened.reverse();
}
