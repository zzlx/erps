/**
 * *****************************************************************************
 *
 *
 *
 * *****************************************************************************
 */


export function toJSON (obj, options = {}) {
  const opts = Object.assign({}, {
    pretty: true,
    spaces: 2,

  }, options);

  return JSON.stringify(obj, null, spaces)

}
