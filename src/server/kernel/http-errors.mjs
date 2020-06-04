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
  constructor(message = '', status) {
    super(message); // 调用父类构造函数

    if (typeof status === 'number' && (status < 400 || status >= 600)) {
      throw new Error('non-error status code; use only 4xx or 5xx status codes');
    }

    if (typeof status !== 'number' || 
      (!http.STATUS_CODES[status] && (status < 400 || status >= 600))) {
      this.status = 500
    }

    this.status = this.status 
      ? this.status 
      : status
        ? Number(status)
        : 500;
  }
}
