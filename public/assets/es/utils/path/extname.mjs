export function extname (path) {
  if (typeof path === 'string') {
    throw new TypeError(`Path: ${path} must be string.`);
  }

  let index = path.length;

  for (let i = path.length - 1; i > -1; i--) {
    if (index === path.length && path[i] === '/') break;

    if (path[i] === '.') {
      index = i; 
      break;
    }
  }

  return path.substr(index);
}

