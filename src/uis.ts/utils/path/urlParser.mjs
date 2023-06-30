/**
 * *****************************************************************************
 *
 * Parse a url path
 *
 * *****************************************************************************
 */

export function urlParser(path) {

  const protocolMatch = path.match(/\w+(?=:\/\/)/);
  const pathIndex = path.search(new RegExp("(?<!\/)\/(?!\/)"));

  let protocol = protocolMatch ? protocolMatch[0] : ''; 
  let pathname = pathIndex === -1 
    ? protocolMatch ? '/' : path 
    : path.substr(pathIndex);
  let search = '';
  let hash = '';

  const searchIndex = path.indexOf('?');
  if (searchIndex !== -1) {
    search = path.substr(searchIndex);
    pathname = pathname.replace(search, '');
  }

  const hashIndex = path.indexOf('#');
  if (hashIndex !== -1) {
    hash = path.substr(hashIndex);
    search = search.replace(hash, '');
  }


  if (pathname && pathname.charAt(0) !== '/') pathname = '/' + pathname;
  if (search && search.charAt(0) !== '?') search = '?' + search;
  if (hash && hash.charAt(0) !== '#') hash = '#' + hash;
  if (search === '?') search = '';
  if (hash === '#') hash = '';

  return {
    protocol,
    pathname,
    search,
    hash,
  };
}
