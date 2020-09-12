/**
 *
 *
 *
 *
 *
 *
 *
 */

export default function getLocations(urlString) {
  const url = new URL(urlString);
  const params = getParams(url.search);
  url['params'] = params;
  return url;
}


/**
 *
 */

function getParams (paramsString) {
  const searchParams = new URLSearchParams(paramsString);
  const params = {};

  // 遍历param对象
  for (let p of searchParams.keys()) {
    params[p] = searchParams.get(p);
  }

  return params;
}
