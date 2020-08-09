/**
 * *****************************************************************************
 *
 * Convert array of 16 byte values to UUID string format of the form:
 * XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
 * 8-4-4-4-12
 *
 * *****************************************************************************
 */


export default function bytesToUUID(buf, offset) {
  let byteToHex = [];

  for (let i = 0; i < 256; ++i) {
    byteToHex[i] = (i + 0x100).toString(16).substr(1);
  }

  let i = offset || 0;
  let bth = byteToHex;

  return ([
    bth[buf[i++]], 
    bth[buf[i++]], 
    bth[buf[i++]], 
    bth[buf[i++]], 
    '-',
    bth[buf[i++]], 
    bth[buf[i++]], 
    '-',
    bth[buf[i++]], 
    bth[buf[i++]], 
    '-',
    bth[buf[i++]], 
    bth[buf[i++]], 
    '-',
    bth[buf[i++]], 
    bth[buf[i++]],
    bth[buf[i++]], 
    bth[buf[i++]],
    bth[buf[i++]], 
    bth[buf[i++]]
  ]).join('');
}

// test
//console.log('Test bytesToUUID: ', bytesToUUID(Buffer.from('abcdefghigklmnnnnnn')));
