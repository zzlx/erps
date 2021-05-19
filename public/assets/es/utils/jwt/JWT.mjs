/**
 * *****************************************************************************
 * 
 * JWT
 *
 * *****************************************************************************
 */ 

import { encode } from '../base64/index.mjs'; 

export class JWT {
  constructor () {
    this.header = {
      "alg": "HS256", // algorithm HS256: HMAC sha256
      "typ": "JWT"    // token type
    };
    this.signature = null;
    this.payload = {};
  }
}

/*
  payload: { "iss": "zzlx", // issuer
    "sub": "1234567890", // subject
    "aud": "", // audience
    "exp": "", // expiration time 
    "nbf": "", // Not Before
    "iat": "",  // Issued At
    "jti": null, // JWT ID

    "name": "John Doe",
    "admin": true
  },
  signature: null
*/
