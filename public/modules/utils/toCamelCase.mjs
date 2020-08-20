export default function toCamelCase(value) {
  return String(value)
    .toLowerCase()
    .replace(/(\b|-|_)\w/g, m => m.toUpperCase())
    .replace(/_|-|\s+|\W/,'');
}
