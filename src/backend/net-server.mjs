/**
 *
 *
 *
 */

import net from 'net';

const server = new net.Server(socketHandler);

server.on('error', errorHandler);

const listenOption = {
  host: 'localhost',
  port: 8080,
  exclusiv: true,
}

server.listen(() => {
  console.log('server is running', server.address());
});

function socketHandler (socket) {
  //socket.end('bye\n');
}



function errorHandler (err) {
  if (e.code === 'EADDRINUSE') {
    console.log('Address in use, retrying...');
    setTimeout(() => {
      server.close();
      server.listen();
    }, 1000);
  }

  throw err;
}
