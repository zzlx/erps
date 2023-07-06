/**
 * *****************************************************************************
 * 
 * JWT
 *
 * JSON Web Token (JWT) 
 * [JWT RFC7519](https://www.rfc-editor.org/rfc/rfc7519.txt)
 * [JWS RFC7571](https://www.rfc-editor.org/rfc/rfc7571.txt)
 *
 * *****************************************************************************
 */ 

import { encode, decode } from '../crypto/base64.mjs'; 
import { sha256 } from '../crypto/sha256.mjs';

export const jwt = jwt => new JWT(jwt);

export class JWT {
  constructor (jwt) {
    this.decode(jwt); // 
  }

  get secret () {
    return this._secret ? this._secret : '';
  }

  set secret (secret) {
    this._secret = secret;
    return this;
  }

  get jwt () {
  }

  encode () {
    
  }

  decode (jwt) {
    if (jwt == null) return; 
    const jwt_array = String.prototype.split.call(jwt, '.'); 
    this.header  = JSON.parse(decode(jwt_array[0]));
    this.payload = JSON.parse(decode(jwt_array[1]));
    this.signature = jwt_array[2];
  }
}

/*
    this.header = {
      alg: "HS256", // algorithm HS256: HMAC sha256
      typ: "JWT",   // token type
    };
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
