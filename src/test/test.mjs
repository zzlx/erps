// 测试
//
import { assert, base64, crypto, utf8, Buffer} from '../../public/assets/es/utils/index.mjs';

//console.log('md5("w"):', crypto.md5('w').buffer);
//const hmac = new crypto.HMAC();

//console.log('hmac-md5("w"):', hmac.update('w', '1234567890abcdef11111111111111111111111111111111111111111111111111111', crypto.md5).digest());
//
//console.log('%s', base64.atob(base64.btoa('Hello, 中国！')));
//
//console.log(new Buffer() instanceof Uint8Array);
//console.log('%s', decodeURIComponent(base64.atob(base64.btoa(encodeURIComponent('wx王学敏')))));

//console.log(btoa('wwwxm'));
//console.log('%s', base64.btoa('wwwxm'));
//console.log('%s', base64.atob('d3d3eG0='));
//console.log('%s', base64.atob(base64.btoa('wwwxm')));
//console.log('%s', crypto.sha1('w'));
console.log('%s', crypto.sha256('w'));

