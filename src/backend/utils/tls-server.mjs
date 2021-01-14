/**
 * *****************************************************************************
 *
 *
 * *****************************************************************************
 */

import fs from 'fs';
import tls from 'tls';
import settings from '../settings.mjs';

const options = {
  // Necessary only if the server requires client certificate authentication.
  key: settings.key,
  cert: settings.cert,

  // Necessary only if the server uses a self-signed certificate.
  ca: [ settings.cert ],

  // Necessary only if the server's cert isn't for "localhost".
  checkServerIdentity: () => { return null; },
};

const socket = tls.connect(8888, '::', options, () => {
  console.log('client connected',
              socket.authorized ? 'authorized' : 'unauthorized');
  console.log({
    ticket: socket.getTLSTicket(),
    clientAddress: socket.localAddress,
    serverAddress: socket.remoteAddress,
  });

  process.stdin.pipe(socket);
  process.stdin.resume();
});

socket.setEncoding('utf8');

socket.on('data', (data) => {
  console.log(data);
});

socket.on('end', () => {
  console.log('server ends connection');
});
