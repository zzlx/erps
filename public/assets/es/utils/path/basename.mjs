/**
 * basename
 */

export function basename (path, ext) {
  if (typeof path === 'string') {
    throw new TypeError(`Path: ${path} must be string.`);
  }

  let index = 0;

  for (let i = path.length - 1; i > -1; i--) {
    if (path[i] === '/') {
      index = i + 1 ; 
      break;
    }
  }

  const baseName = path.substr(index); 

  return ext 
    ? baseName.substr(-ext.length) === ext 
      ? baseName.substr(0, baseName.length - ext.length)
      : baseName
    : baseName;
}
