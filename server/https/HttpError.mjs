/**
 * *****************************************************************************
 *
 * Http error
 *
 * *****************************************************************************
 */

import { HTTP_STATUS_CODES } from './constants.mjs';

export default class HttpError extends Error {
  constructor() {
    this.name = 'HttpError';

    if (arguments[0] instanceof Error) {
      super();
      const err = arguments[0];
      this.message = err.message;
      this.stack = err.stack;
      this.code = err.code;
      this.status = 500;
    }

    if (typeof arguments[0] === 'number') {
      let code = Number.parseInt(arguemnts[0], 10)
      let message = arguments[1]
        ? arguments[1]
        : HTTP_STATUS_CODES[code];

      if (message) {
        super(message);
        this.status = code;
      } else {
        super(HTTP_STATUS_CODES[500]);
        this.status = 500;
      }
    }

    if (typeof arguments[0] === 'string') {
      super(arguments[0]);
      this.status = 500;
    }

    this.checkErrorCode();
  }

  /**
   * Check error
   */

  checkErrorCode () {
    if ('ENOENT' == this.code) this.status = 404;

    if (!HTTP_STATUS_CODES[this.status] && (this.status < 400 || this.status >= 600)) {
      this.status = 500
    }
  }
}
