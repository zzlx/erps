/**
 * *****************************************************************************
 * 
 * ACME client
 *
 * Reference: [RFC 8555](https://tools.ietf.org/html/rfc8555)
 *
 * @author: wangxuemin@zzlx.org
 * *****************************************************************************
 */

import http2 from 'http2';
import debuglog from './debuglog.mjs';
import { paths } from './settings/index.mjs';

// debug tool
const debug = debuglog('debug:acme-client');

// constants
const ACME_API = "https://acme-v02.api.letsencrypt.org/directory";
const ACME_API_STAGING = "https://acme-staging-v02.api.letsencrypt.org/directory";

export const acme = new (class ACMEClient {
  constructor () {
    this.name = 'ACMEClient';
    debug(this.name);
  }

})();
