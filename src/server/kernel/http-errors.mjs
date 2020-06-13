/**
 * *****************************************************************************
 *
 * Http error
 *
 * *****************************************************************************
 */

import util from 'util';
import http from 'http';
const debug = util.debuglog('debug:http-errors');

export default class HttpError extends Error {
  constructor() {
    if (arguments[0] instanceof Error) {
      super();
      this.message = arguments[0].message;
      this.stack = arguments[0].stack;
      this.status = 500;
    }

    if (typeof arguments[0] === 'number') {
      let code = Number.parseInt(arguemnts[0], 10)
      let message = arguments[1]
        ? arguments[1]
        : http.STATUS_CODES[code];

      if (message) {
        super(message);
        this.status = code;
      } else {
        super(http.STATUS_CODES[500]);
        this.status = 500;
      }
    }

    if (typeof arguments[0] === 'string') {
      super(arguments[0]);
      this.status = 500;
    }

    this.checkErrorCode();

    if (!http.STATUS_CODES[this.status] && (this.status < 400 || this.status >= 600)) {
      this.status = 500
    }
  }

  /**
   *
   * 检查错误代码
   *
   */

  checkErrorCode () {
    // ENOENT support
    if ('ENOENT' == this.code) this.status = 404;
  }
}
