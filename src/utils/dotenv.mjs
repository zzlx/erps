/**
 *
 *
 *
 */

import fs from 'fs';
import path from 'path';

export default function dotenv(envFile) {
  if (!fs.existsSync(envFile)) return {};
  const envFileContent = fs.readFileSync(envFile, 'utf8');
  const parsedObj = parser(envFileContent); 
  return parsedObj;
}

function parser (src) {
  const obj = Object.create(null);

  src.toString().split('\n').forEach(line => {
    const keyValuePair = line.match(/^s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (null !== keyValuePair) {
      const key = keyValuePair[1]; 
      let value = keyValuePair[2] || '';
      const len = value ? value.length : 0;
      if (value>0 && value.charAt(0) === '"' && value.charAt(len -1) === '"') {
        value = value.replace(/\\n/gm, '');
      }
    
      value = value.replace(/(^['"]|['"]$)/g, '').trim();
      obj[key] = value;

    }
  });

  return obj;
}
