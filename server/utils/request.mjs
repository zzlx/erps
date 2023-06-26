/**
 * *****************************************************************************
 *
 * request
 *
 * *****************************************************************************
 */

import http2 from 'node:http2';
import fs from 'node:fs';
import path from 'node:path';
import util from 'node:util';
import { configs } from '../../settings/configs.mjs';

const debug = util.debuglog('debug:request');

export function request (url) {

  const client = http2.connect('https://localhost:8443', {
    ca: fs.readFileSync('/etc/ssl/test-cert.pem'),
  });

  client.on('error', (err) => console.error('出错了。。。', err));

  const req = client.request({ ':path': '/' });

  req.on('response', (headers, flags) => {
    for (const name in headers) {
      console.log(`${name}: ${headers[name]}`);
    }
  });

  req.setEncoding('utf8');

  let data = '';
  req.on('data', (chunk) => { data += chunk; });
  req.on('end', () => {
    console.log(`\n${data}`);
    client.close();
  });
  req.end();

}

// test
request();
