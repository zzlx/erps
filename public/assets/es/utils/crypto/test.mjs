import { sha256 } from './sha256.mjs';
import { sha1 } from './sha1.mjs';
import { md5 } from './md5.mjs';
import { hmac } from './hmac.mjs';
import { atob, atobFn } from '../base64/atob.mjs'; 
import { btoa, btoaFn } from '../base64/btoa.mjs'; 
import { encode } from '../utf8/encode.mjs'; 

console.log('%s', encode('wxm王学敏'));
//console.log(md5('w'))kkk;
//console.log("%s", hmac('w', '18039105900', md5));
