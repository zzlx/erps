/**
 * *****************************************************************************
 * 
 * Httpæå¡ç¨åº
 * ==============
 *
 * ð éææä»¶æå¡
 * ð å¨æè·¯ç±æå¡
 * ð APIè·¯ç±æå¡
 *
 * *****************************************************************************
 */

import App from './Application.mjs';
import { cors } from './middlewares/cors.mjs';
import { error } from './middlewares/error.mjs';
import { logger } from './middlewares/logger.mjs';
import { cookies } from './middlewares/cookies.mjs';
import { compress } from './middlewares/compress.mjs';
import { markdown } from './middlewares/markdown.mjs';
import { xResponse } from './middlewares/xResponse.mjs';

import { paths, system } from '../settings/index.mjs';
import debuglog from '../debuglog.mjs';
import router from './routes.mjs';
import { websocket } from '../websocket.mjs';

const debug = debuglog('debug:httpd');

// This is the smart shutdown mode.
// After receiving SIGTERM the server disallows new connections, 
// but let the existing sessions and their work nornally.
process.on('SIGTERM', signal => {
  if (process.env.NODE_ENV === 'development') {
    // å¼åç¯å¢ä¸­ç´æ¥ç»ææå¡è¿ç¨
    return process.exit();
  }

  app.server.close();
});

process.on('uncaughtException', (error, origin) => {
  console.log(error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.log(reason);
});

// åå§åæå¡å¨ç¨åº
// éç½®æå¡å¨åºç¡åè½
const app = new App({
  key: system.privateKey,
  cert: system.cert,
  passphrase: system.passphrase,
});

const ws = websocket({ server: app.server, });

ws.on('message', (msg, socket) => {
  debug(`Receive a websocket message: ${msg} from client(${socket.remoteAddress}:${socket.remotePort})`);
});

// he 'secureConnection' event is emitted after the handshaking process 
// for a new connection has successfully completed. 
//app.server.on('secureConnection', serverCtl);

app.use(error()); // è®°å½ä¸­é´ä»¶éè¯¯
app.use(logger()); // è®¿é®æ¥å¿
app.use(xResponse()); // ååºæ¶é´è®°å½
app.use(cors()); // è·¨åè®¿é®æ¯æ
app.use(cookies()); // å¨å±cookieæ¯æ

// æå¡å¨ç«¯è·¯ç±éç½®
app.use(router.routes()); // æ§è¡æå¡ç«¯è·¯ç±éç½®
app.use(router.allowedMethods()); // è·¯ç±æ¹æ³

// æ ¹æ®æ¡ä»¶å¯¹ååºåå®¹è¿è¡åç¼©
app.use(markdown()); // å¯ç¨markdownè§£æ
app.use(compress()); // å¯ç¨åå®¹åç¼©

app.listen({ 
  ipv6Only: false, 
  exclusive: true,
  host: system.isSupportIPv6 ? "::" : '0.0.0.0',
  port: '8888',
}, function () {
  if (process.channel && process.send) {
    process.send({ 
      message: 'æå¡å¨å·²å¯å¨',
      pid: process.pid,
      address: this.address(),
    });
  } else {
    if (process.env.NODE_ENV === 'development') console.clear(); // clear console
    debug('The %s http daemon is listening on: %s', process.env.NODE_ENV, this.address());
  }
});

/**
 * ç®¡çæå¡å¨
 */

function serverCtl (socket) {
  socket.on('data', buffer => {
    try {

      // è¿æ»¤æ°æ®å¸§
      if (buffer.readUInt8(0) !== 0b11111111) return; // æ ¹æ®ç¬¬ä¸ä¸ªå­èå¤æ­
      const data = buffer.slice(1); 
      debug(data.toString());
      const message = JSON.parse(data.toString());

      if (message.token !== settings.passphrase) return; // è¿æ»¤socket

      switch(message.command) {
        case 'STOP': 
          app.server.close(() => { });
          break;

        case 'RESTART': 
          app.server.close(() => {
            start();
          });
          break;
        default:
          debug('Unknown Server Action.');
      }
    } catch (e) {
      debug(e); //ä¸åå¤ç
    }
  });
}
