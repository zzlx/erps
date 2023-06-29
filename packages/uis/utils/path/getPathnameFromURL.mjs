/**
 * get pathname from url path
 */

export function getPathnameFromURL(path) {
  if (!isURLPath(path)) return path

  const url = new URL(path)
  return url.pathname;
}

