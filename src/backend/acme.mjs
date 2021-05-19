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
const dateSN = () => formatDate('yymmddHHMMss');

export class ACMEClient {
  constructor (opts = {}) {
    assert(opts.ACME_API, 'ACME_API must be provided.')
    this.name = opts.name ? opts.name : 'ACMEClient';
    this.API  = true ? opts.ACME_API_STAGING : opts.ACME_API;


    this.registerAccount();
  }

  /**
   * Register an account
   */

  registerAccount() {

    this.conn = http2.connect(this.API);
    this.conn.on('error', err => {
      debug(err)
    });
    this.conn.on('close', (e) => {
      debug(`client connection is closed.`);
    });


    const req = this.conn.request({ 
      ':method': '',
      ':path': '/directory'
    });

    req.on('error', err => {
      debug(`request error: `, err.message);
    });

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
      this.conn.close();
    });
    req.close(); // close request
  }

  
  /**
   * Submit CSR
   */

  getCertificate () {
    // step_1: Submit an order for a certificate to be issued
    // step_2: Prove control of any identifiers requested in the certificate
    // step_3: Finalize the order by submitting a CSR
    // step_4: Await issuance and download the issued certificate


  }


}

export const acme = new ACMEClient({
  ACME_API: "https://acme-v02.api.letsencrypt.org/directory",
  ACME_API_STAGING: "https://acme-staging-v02.api.letsencrypt.org/directory",
});
