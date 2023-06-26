/**
 * *****************************************************************************
 *
 * Http Error
 *
 *
 * *****************************************************************************
 */

import { HTTP_STATUS_CODES } from '../constants.mjs';

/* Get the code class of a status code. */
export const getCodeClass = c => Number(String(c).charAt(0) + '00');

export class HttpError extends Error {
  constructor() {
    super();

    this.name = 'HttpError';
    this.status = 500;
    this.expose = process.env.NODE_ENV === 'development' ? true : false;

    for (let i = 0; i < arguments.length; i++) {
      const arg = arguments[i];

      if (arg instanceof Error) {
        this.status = arg.status || arg.statusCode || 500;
        this.message = arg.message;
        this.stack = arg.stack;
        this.code = arg.code;
        continue;
      }

      if (typeof arg === 'string') {
        this.message = arg;
        continue;
      }

      if (typeof arg === 'number') {
        this.status = Number.parseInt(arg, 10);
        if (i !== 0) {}
        continue;
      }

      /*
      if (typeof arg === 'obj') {
        props = arg;
        continue;
      }
      */

    } // end of for loop

    this.checkErrorCode();

    if (!this.message) {
      this.message = this.status ? HTTP_STATUS_CODES[this.status] : 'Unknown'; 
    }
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
