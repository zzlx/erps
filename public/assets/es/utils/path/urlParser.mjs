/**
 * 解析url路径
 */

export function urlParser(path) {

  let pathname = path || '/';
  let search = '';
  let hash = '';

  // 哈希索引号
  const hashIndex = pathname.indexOf('#');

  if (hashIndex !== -1) {
    hash = pathname.substr(hashIndex);
    pathname = pathname.substr(0, hashIndex);
  }

  // 查询字符串索引号
  const searchIndex = pathname.indexOf('?');

  if (searchIndex !== -1) {
    search = pathname.substr(searchIndex);
    pathname = pathname.substr(0, searchIndex);
  }

  return {
    pathname: pathname,
    search: search === '?' ? '' : search,
    hash: hash === '#' ? '' : hash
  };
}

