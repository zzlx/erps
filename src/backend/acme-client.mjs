/**
 * *****************************************************************************
 * 
 * Automatic Certificate Management Environment
 *
 * ACME v2 [(RFC 8555)](https://tools.ietf.org/html/rfc8555)
 *
 * * [Production] https://acme-v02.api.letsencrypt.org/directory 
 * * [Staging] https://acme-staging-v02.api.letsencrypt.org/directory
 *
 * *****************************************************************************
 */

import assert from 'assert';
import crypto from 'crypto';
import http2 from 'http2';
import debuglog from './debuglog.mjs';
import { paths } from './settings/index.mjs';
import { formatDate } from './utils.lib.mjs';

const debug = debuglog('debug:acme-client'); // debug tool

export class ACMEClient {
  constructor (opts = {}) {
    assert(opts.ACME_API, 'ACME_API must be provided.')
    this.name = opts.name ? opts.name : 'ACMEClient';
    this.API  = true ? opts.ACME_API_STAGING : opts.ACME_API;

    debug(formatDate('yymmddHHMMss'));

    this.request();
  }

  request () {
    const c = http2.connect(this.API);
    c.on('error', (err) => debug(err));
    const req = c.request({ ':path': '/directory'});

    req.on('response', (headers, flags) => { 
      for (const name in headers) { 
        console.log(`${name}: ${headers[name]}`); 
      } 
    });

    req.setEncoding('utf8');
    let data = '';
    req.on('data', (chunk) => { data += chunk; });
    req.on('end', () => {
      debug(`\n${data}`);
      c.close();
    });
    req.close();
  }

  


}

export const acme = new ACMEClient({
  ACME_API: "https://acme-v02.api.letsencrypt.org/directory",
  ACME_API_STAGING: "https://acme-staging-v02.api.letsencrypt.org/directory",
});
