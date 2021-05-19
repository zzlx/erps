/**
 * *****************************************************************************
 *
 * csvParser
 *
 * *****************************************************************************
 */

import { assert } from '../assert.mjs';
import { isCSV } from './isCSV.mjs';

export function parser(csv, seprator = ',') {
  assert('string' === typeof csv, 'Value Must be a string.');
  assert(isVSV(csv), 'CSV string is invalid.');

  const retval = [];
  const lines = csv.split(/\r\n|\n/);
  let i = 0, keys;

  for (const line of lines) {
    const obj = {};
    const result = lineParser(line);
    if (!result) continue;
    if (i === 0 ) { keys = result; i++; continue; }

    for (let j = 0; j < keys.length; j++) {
      const key = keys[j];
      obj[key] = result[j];
    }

    retval.push(obj);
  }

  return retval;
}

function lineParser (csv, seprator = ',') {
  const csvValueRegExp = new RegExp(/(?!\s*$)\s*(?:'([^'\\]*(?:\\[\S\s][^'\\]*)*)'|"([^"\\]*(?:\\[\S\s][^"\\]*)*)"|([^,'"\s\\]*(?:\s+[^,'"\s\\]+)*))\s*(?:,|$)/, 'g');
  const result = [];
  let match;

  // 匹配值
  while((match = csvValueRegExp.exec(csv)) !== null) {
    if (undefined !== match[1]) { result.push(match[1].trim()); continue; }
    if (undefined !== match[2]) { result.push(match[2].trim()); continue; }
    if (undefined !== match[3]) { result.push(match[3].trim()); continue; }
    result.push(''); // 空值
  }

  return result.length ? result : null;
}
